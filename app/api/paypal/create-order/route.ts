import { NextResponse } from "next/server"

import { paypalCreateOrder } from "@/lib/paypal"

export const runtime = "nodejs"

export async function POST(req: Request) {
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

    // PayPal expects a string with 2 decimals for most currencies (USD etc.)
    const amount = amountNum.toFixed(2)

    const order = await paypalCreateOrder({
      amount,
      currencyCode,
      description: body.description,
    })

    return NextResponse.json({ id: order.id })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
