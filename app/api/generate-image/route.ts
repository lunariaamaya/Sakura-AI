import { NextResponse } from "next/server"

import { IMAGE_GENERATION_COST, consumeUserCredits, getUserCredits } from "@/lib/credits"
import { enforceRateLimit, enforceSameOrigin, normalizePrompt } from "@/lib/security"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

const OPENROUTER_CHAT_COMPLETIONS_URL = "https://openrouter.ai/api/v1/chat/completions"
const MODEL = "google/gemini-2.5-flash-image"

function pickImageUrl(item: unknown): string | null {
  if (typeof item === "string") {
    return item
  }
  if (!item || typeof item !== "object") return null
  const anyItem = item as any

  const url =
    anyItem?.image_url?.url ??
    anyItem?.imageUrl?.url ??
    anyItem?.url ??
    anyItem?.image_url ??
    anyItem?.imageUrl

  return typeof url === "string" ? url : null
}

function b64ToDataUrl(value: unknown, mimeType?: unknown): string | null {
  if (typeof value !== "string" || value.length === 0) return null
  const mime =
    typeof mimeType === "string" && mimeType.trim()
      ? mimeType.trim()
      : "image/png"
  return `data:${mime};base64,${value}`
}

function collectImageUrlsFromString(content: string): string[] {
  const urls: string[] = []

  const dataUrls = content.match(/data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+/g)
  if (dataUrls) urls.push(...dataUrls)

  const markdownMatches = [...content.matchAll(/!\[[^\]]*]\((https?:\/\/[^)\s]+)\)/g)]
  for (const match of markdownMatches) {
    if (match[1]) urls.push(match[1])
  }

  const directImageLinks = [...content.matchAll(/https?:\/\/\S+\.(?:png|jpg|jpeg|webp|gif)(?:\?\S+)?/gi)]
  for (const match of directImageLinks) {
    if (match[0]) urls.push(match[0])
  }

  return urls
}

function extractImagesFromMessage(message: unknown): string[] {
  if (!message || typeof message !== "object") return []
  const anyMsg = message as any

  const urls: string[] = []

  // OpenRouter image generation can return `message.images` (array of image objects).
  if (Array.isArray(anyMsg.images)) {
    for (const img of anyMsg.images) {
      const url = pickImageUrl(img)
      if (url) urls.push(url)
    }
  }

  // Some providers may return multimodal `content` as an array.
  if (Array.isArray(anyMsg.content)) {
    for (const part of anyMsg.content) {
      const url = pickImageUrl((part as any)?.image_url ?? (part as any)?.imageUrl ?? part)
      if (url) urls.push(url)
    }
  }

  // Fallback: try to find a data URL in string content.
  if (typeof anyMsg.content === "string") {
    urls.push(...collectImageUrlsFromString(anyMsg.content))
  }

  const contentArray = Array.isArray(anyMsg.content) ? anyMsg.content : []
  for (const part of contentArray) {
    if (typeof (part as any)?.text === "string") {
      urls.push(...collectImageUrlsFromString((part as any).text))
    }

    const b64Image =
      b64ToDataUrl((part as any)?.b64_json, (part as any)?.mime_type) ??
      b64ToDataUrl((part as any)?.b64Json, (part as any)?.mimeType)
    if (b64Image) urls.push(b64Image)
  }

  const messageB64Image =
    b64ToDataUrl(anyMsg?.b64_json, anyMsg?.mime_type) ??
    b64ToDataUrl(anyMsg?.b64Json, anyMsg?.mimeType)
  if (messageB64Image) urls.push(messageB64Image)

  return Array.from(new Set(urls))
}

function extractImagesFromResponse(data: any): string[] {
  const urls: string[] = []

  urls.push(...extractImagesFromMessage(data?.choices?.[0]?.message))

  if (Array.isArray(data?.choices)) {
    for (const choice of data.choices) {
      urls.push(...extractImagesFromMessage(choice?.message))
      urls.push(...extractImagesFromMessage(choice?.delta))
    }
  }

  if (Array.isArray(data?.images)) {
    for (const item of data.images) {
      const url = pickImageUrl(item)
      if (url) urls.push(url)
    }
  }

  if (Array.isArray(data?.data)) {
    for (const item of data.data) {
      const url = pickImageUrl(item)
      if (url) urls.push(url)
      const b64Image =
        b64ToDataUrl((item as any)?.b64_json, (item as any)?.mime_type) ??
        b64ToDataUrl((item as any)?.b64Json, (item as any)?.mimeType)
      if (b64Image) urls.push(b64Image)
    }
  }

  if (typeof data?.output_text === "string") {
    urls.push(...collectImageUrlsFromString(data.output_text))
  }

  return Array.from(new Set(urls))
}

async function fileToDataUrl(file: File): Promise<string> {
  const buf = Buffer.from(await file.arrayBuffer())
  return `data:${file.type};base64,${buf.toString("base64")}`
}

export async function POST(req: Request) {
  const blockedByOrigin = enforceSameOrigin(req)
  if (blockedByOrigin) return blockedByOrigin

  const blockedByRateLimit = enforceRateLimit(req, "generate-image", 20, 60_000)
  if (blockedByRateLimit) return blockedByRateLimit

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      {
        error: "Please sign in with Google to generate images.",
        code: "UNAUTHORIZED",
        loginUrl: "/auth/sign-in/google?next=%2F%23editor",
      },
      { status: 401 },
    )
  }

  let currentCredits
  try {
    currentCredits = await getUserCredits(user.id)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load credits"
    return NextResponse.json({ error: message }, { status: 500 })
  }

  if (currentCredits.totalCredits < IMAGE_GENERATION_COST) {
    return NextResponse.json(
      {
        error: "Insufficient credits. Please recharge to continue.",
        code: "INSUFFICIENT_CREDITS",
        remainingCredits: currentCredits.totalCredits,
      },
      { status: 402 },
    )
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing OPENROUTER_API_KEY (set it in .env.local)" },
      { status: 500 }
    )
  }

  let prompt = ""
  let imageFile: File | null = null
  let imageDataUrl: string | null = null

  const contentType = req.headers.get("content-type") ?? ""
  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData()
    prompt = normalizePrompt(String(form.get("prompt") ?? ""))
    const file = form.get("image")
    if (file instanceof File) imageFile = file
  } else {
    const body = await req.json().catch(() => null) as any
    prompt = normalizePrompt(String(body?.prompt ?? ""))
    if (typeof body?.imageDataUrl === "string") imageDataUrl = body.imageDataUrl
  }

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
  }
  if (prompt.length > 1500) {
    return NextResponse.json({ error: "Prompt too long (max 1500 chars)" }, { status: 400 })
  }

  if (imageFile) {
    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid image file type" }, { status: 400 })
    }
    if (imageFile.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Image too large (max 10MB)" }, { status: 400 })
    }
    imageDataUrl = await fileToDataUrl(imageFile)
  }

  if (imageDataUrl && imageDataUrl.length > 15_000_000) {
    return NextResponse.json({ error: "Image payload too large" }, { status: 400 })
  }

  const messages = [
    {
      role: "user",
      content: imageDataUrl
        ? [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ]
        : [{ type: "text", text: prompt }],
    },
  ]

  const referer =
    req.headers.get("origin") ??
    req.headers.get("referer") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"

  const title = process.env.OPENROUTER_APP_NAME ?? "Sakura AI"

  const upstream = await fetch(OPENROUTER_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": referer,
      "X-Title": title,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
    }),
  })

  const text = await upstream.text()
  if (!upstream.ok) {
    return NextResponse.json(
      {
        error: "OpenRouter request failed",
        status: upstream.status,
        body: text.slice(0, 2000),
      },
      { status: 502 }
    )
  }

  let data: any
  try {
    data = JSON.parse(text)
  } catch {
    return NextResponse.json(
      {
        error: "OpenRouter returned non-JSON payload",
        body: text.slice(0, 2000),
      },
      { status: 502 },
    )
  }

  const message = data?.choices?.[0]?.message
  const images = extractImagesFromResponse(data)

  if (images.length === 0) {
    return NextResponse.json(
      {
        error: "No images returned by the model",
        // Keep a small debug payload for local troubleshooting.
        message,
      },
      { status: 502 }
    )
  }

  let consumeResult
  try {
    consumeResult = await consumeUserCredits(user.id, IMAGE_GENERATION_COST)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to consume credits"
    return NextResponse.json({ error: message }, { status: 500 })
  }

  if (!consumeResult.ok) {
    return NextResponse.json(
      {
        error: "Insufficient credits. Please recharge to continue.",
        code: "INSUFFICIENT_CREDITS",
        remainingCredits: consumeResult.balance.totalCredits,
      },
      { status: 402 },
    )
  }

  return NextResponse.json({
    images,
    remainingCredits: consumeResult.balance.totalCredits,
    spentCredits: IMAGE_GENERATION_COST,
  })
}
