import { NextResponse } from "next/server"

import { paypalCreateOrder } from "@/lib/paypal"
import { PAYPAL_CATALOG, type PayPalSku } from "@/lib/paypal-catalog"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"
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
      sku,
      kind: catalogItem.kind,
      expected_amount: Number(catalogItem.amount).toFixed(2),
    })

    // PayPal expects a string with 2 decimals for most currencies (USD etc.)
    const amount = Number(catalogItem.amount).toFixed(2)

    const order = await paypalCreateOrder({
      amount,
      currencyCode: catalogItem.currencyCode,
      description: catalogItem.description.slice(0, 120),
      customId,
    })

    const admin = getSupabaseAdminClient() as any
    const { error: upsertError } = await admin
      .from("payment_orders")
      .upsert(
        {
          paypal_order_id: order.id,
          user_id: user.id,
          sku,
          kind: catalogItem.kind,
          expected_amount: amount,
          expected_currency: catalogItem.currencyCode,
          credits_to_grant: catalogItem.credits,
          status: "created",
          paypal_custom_id: customId,
        },
        { onConflict: "paypal_order_id" },
      )

    if (upsertError) {
      return NextResponse.json({ error: `Failed to save order: ${upsertError.message}` }, { status: 500 })
    }

    return NextResponse.json({ id: order.id })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
