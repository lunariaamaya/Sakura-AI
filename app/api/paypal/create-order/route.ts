import { NextResponse } from "next/server"

import { paypalCreateOrder } from "@/lib/paypal"
import { enforceRateLimit, enforceSameOrigin } from "@/lib/security"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const blockedByOrigin = enforceSameOrigin(req)
  if (blockedByOrigin) return blockedByOrigin

  const blockedByRateLimit = enforceRateLimit(req, "paypal-create-order", 30, 60_000)
  if (blockedByRateLimit) return blockedByRateLimit

  try {
    const body = (await req.json()) as {
      amount?: string | number
      currencyCode?: string
      description?: string
    }

    const amountNum = Number(body.amount)
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      )
    }

    const currencyCode = (body.currencyCode ?? "USD").toUpperCase()
    if (!/^[A-Z]{3}$/.test(currencyCode)) {
      return NextResponse.json({ error: "Invalid currency code" }, { status: 400 })
    }

    // PayPal expects a string with 2 decimals for most currencies (USD etc.)
    const amount = amountNum.toFixed(2)

    const order = await paypalCreateOrder({
      amount,
      currencyCode,
      description:
        typeof body.description === "string"
          ? body.description.slice(0, 120)
          : undefined,
    })

    return NextResponse.json({ id: order.id })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
