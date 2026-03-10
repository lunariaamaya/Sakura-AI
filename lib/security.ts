import { NextResponse } from "next/server"

import { checkRateLimit } from "@/lib/rate-limit"

function safeUrl(raw: string | null): URL | null {
  if (!raw) return null
  try {
    return new URL(raw)
  } catch {
    return null
  }
}

function parseOriginList(raw: string | undefined): URL[] {
  if (!raw) return []
  const parts = raw
    .split(/[,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean)
  const urls: URL[] = []
  for (const part of parts) {
    const parsed = safeUrl(part)
    if (parsed) urls.push(parsed)
  }
  return urls
}

function getExpectedOrigins(request: Request): URL[] {
  const requestUrl = new URL(request.url)
  const configured = safeUrl(process.env.NEXT_PUBLIC_SITE_URL ?? null)
  const forwardedHost = request.headers.get("x-forwarded-host")
  const forwardedProto = request.headers.get("x-forwarded-proto")
  const forwardedOrigin = forwardedHost
    ? safeUrl(`${forwardedProto ?? "https"}://${forwardedHost}`)
    : null
  const allowList = parseOriginList(process.env.ALLOWED_ORIGINS)

  const candidates = [
    configured,
    forwardedOrigin,
    new URL(`${requestUrl.protocol}//${requestUrl.host}`),
    ...allowList,
  ].filter(Boolean) as URL[]

  const seen = new Set<string>()
  const unique: URL[] = []
  for (const url of candidates) {
    const key = `${url.protocol}//${url.host}`
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(url)
  }

  return unique
}

export function enforceSameOrigin(request: Request): NextResponse | null {
  const originHeader = request.headers.get("origin")
  if (!originHeader) return null

  const origin = safeUrl(originHeader)
  if (!origin) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 })
  }

  const expected = getExpectedOrigins(request)
  const sameOrigin = expected.some(
    (url) => origin.protocol === url.protocol && origin.host === url.host
  )

  if (!sameOrigin) {
    return NextResponse.json({ error: "Cross-site request blocked" }, { status: 403 })
  }

  return null
}

export function getClientIp(request: Request): string {
  const xForwardedFor = request.headers.get("x-forwarded-for")
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim()
  }
  return request.headers.get("x-real-ip") ?? "unknown"
}

export function enforceRateLimit(
  request: Request,
  keySuffix: string,
  limit: number,
  windowMs: number,
): NextResponse | null {
  const ip = getClientIp(request)
  const key = `${keySuffix}:${ip}`
  const result = checkRateLimit(key, limit, windowMs)

  if (result.ok) return null

  return NextResponse.json(
    {
      error: "Too many requests. Please try again later.",
      retryAfterMs: result.retryAfterMs,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.max(1, Math.ceil(result.retryAfterMs / 1000))),
      },
    },
  )
}

export function normalizePrompt(input: string): string {
  return input.replace(/\u0000/g, "").trim()
}
