import { NextResponse } from "next/server"

import { paypalCaptureOrder } from "@/lib/paypal"
import { enforceRateLimit, enforceSameOrigin } from "@/lib/security"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const blockedByOrigin = enforceSameOrigin(req)
  if (blockedByOrigin) return blockedByOrigin

  const blockedByRateLimit = enforceRateLimit(req, "paypal-capture-order", 30, 60_000)
  if (blockedByRateLimit) return blockedByRateLimit

  try {
    const body = (await req.json()) as { orderId?: string }
    if (!body.orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 })
    }
    if (!/^[A-Za-z0-9-]{8,64}$/.test(body.orderId)) {
      return NextResponse.json({ error: "Invalid orderId" }, { status: 400 })
    }

    const result = await paypalCaptureOrder(body.orderId)
    return NextResponse.json(result)
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
