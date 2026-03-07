type Bucket = {
  tokens: number
  updatedAt: number
}

const buckets = new Map<string, Bucket>()

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfterMs: number } {
  const now = Date.now()
  const refillPerMs = limit / windowMs
  const current = buckets.get(key)

  if (!current) {
    buckets.set(key, { tokens: limit - 1, updatedAt: now })
    return { ok: true, retryAfterMs: 0 }
  }

  const elapsed = now - current.updatedAt
  const nextTokens = Math.min(limit, current.tokens + elapsed * refillPerMs)

  if (nextTokens < 1) {
    const retryAfterMs = Math.ceil((1 - nextTokens) / refillPerMs)
    buckets.set(key, { tokens: nextTokens, updatedAt: now })
    return { ok: false, retryAfterMs }
  }

  buckets.set(key, { tokens: nextTokens - 1, updatedAt: now })
  return { ok: true, retryAfterMs: 0 }
}
