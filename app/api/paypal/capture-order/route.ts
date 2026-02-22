import { NextResponse } from "next/server"

import { paypalCaptureOrder } from "@/lib/paypal"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { orderId?: string }
    if (!body.orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 })
    }

    const result = await paypalCaptureOrder(body.orderId)
    return NextResponse.json(result)
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
