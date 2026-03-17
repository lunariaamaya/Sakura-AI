import { NextResponse } from "next/server"

import { paypalCreateOrder } from "@/lib/paypal"
import { PAYPAL_CATALOG, type PayPalSku } from "@/lib/paypal-catalog"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { enforceRateLimit, enforceSameOrigin } from "@/lib/security"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const blockedByOrigin = enforceSameOrigin(req)
  if (blockedByOrigin) return blockedByOrigin

  const blockedByRateLimit = enforceRateLimit(req, "paypal-create-order", 30, 60_000)
  if (blockedByRateLimit) return blockedByRateLimit

  try {
    const body = (await req.json()) as { sku?: string }
    const sku = body.sku

    if (!sku || typeof sku !== "string") {
      return NextResponse.json({ error: "Missing sku" }, { status: 400 })
    }

    const catalogItem = PAYPAL_CATALOG[sku as PayPalSku]
    if (!catalogItem) {
      return NextResponse.json({ error: "Invalid sku" }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const customId = JSON.stringify({
      user_id: user.id,
      credit_amount: catalogItem.credits,
      sku,
    })

    // PayPal expects a string with 2 decimals for most currencies (USD etc.)
    const amount = Number(catalogItem.amount).toFixed(2)

    const order = await paypalCreateOrder({
      amount,
      currencyCode: catalogItem.currencyCode,
      description: catalogItem.description.slice(0, 120),
      customId,
    })

    return NextResponse.json({ id: order.id })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
