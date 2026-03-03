import { NextResponse } from "next/server"

import { IMAGE_GENERATION_COST, consumeUserCredits, getUserCredits } from "@/lib/credits"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

const OPENROUTER_CHAT_COMPLETIONS_URL = "https://openrouter.ai/api/v1/chat/completions"
const MODEL = "google/gemini-2.5-flash-image"

function pickImageUrl(item: unknown): string | null {
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
    const matches = anyMsg.content.match(/data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+/g)
    if (matches) urls.push(...matches)
  }

  return Array.from(new Set(urls))
}

async function fileToDataUrl(file: File): Promise<string> {
  const buf = Buffer.from(await file.arrayBuffer())
  return `data:${file.type};base64,${buf.toString("base64")}`
}

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      {
        error: "Please sign in with Google to generate images.",
        code: "UNAUTHORIZED",
        loginUrl: "/auth/sign-in/google?next=/#editor",
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
    prompt = String(form.get("prompt") ?? "")
    const file = form.get("image")
    if (file instanceof File) imageFile = file
  } else {
    const body = await req.json().catch(() => null) as any
    prompt = String(body?.prompt ?? "")
    if (typeof body?.imageDataUrl === "string") imageDataUrl = body.imageDataUrl
  }

  if (!prompt.trim()) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
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

  const data = JSON.parse(text)
  const message = data?.choices?.[0]?.message
  const images = extractImagesFromMessage(message)

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
