import { NextResponse } from "next/server"

import { PAYPAL_CATALOG, type PayPalSku } from "@/lib/paypal-catalog"
import { paypalCaptureOrder } from "@/lib/paypal"
import { enforceRateLimit, enforceSameOrigin } from "@/lib/security"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

function extractCustomId(result: any): string | null {
  const purchaseUnit = Array.isArray(result?.purchase_units) ? result.purchase_units[0] : null
  const capture = Array.isArray(purchaseUnit?.payments?.captures)
    ? purchaseUnit.payments.captures[0]
    : null

  if (typeof capture?.custom_id === "string") return capture.custom_id
  if (typeof purchaseUnit?.custom_id === "string") return purchaseUnit.custom_id
  return null
}

function extractCapturedAmount(result: any): { value: number | null; currency: string | null } {
  const purchaseUnit = Array.isArray(result?.purchase_units) ? result.purchase_units[0] : null
  const capture = Array.isArray(purchaseUnit?.payments?.captures)
    ? purchaseUnit.payments.captures[0]
    : null

  const amountValue = capture?.amount?.value ?? purchaseUnit?.amount?.value ?? null
  const currencyCode = capture?.amount?.currency_code ?? purchaseUnit?.amount?.currency_code ?? null

  const valueNumber = Number(amountValue)
  return {
    value: Number.isFinite(valueNumber) ? valueNumber : null,
    currency: typeof currencyCode === "string" ? currencyCode : null,
  }
}

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

    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await paypalCaptureOrder(body.orderId)
    const customIdRaw = extractCustomId(result)
    if (!customIdRaw) {
      return NextResponse.json(
        { error: "Missing custom_id in PayPal capture result" },
        { status: 400 },
      )
    }

    let customData: { user_id?: string; sku?: string }
    try {
      customData = JSON.parse(customIdRaw)
    } catch {
      return NextResponse.json({ error: "Invalid custom_id payload" }, { status: 400 })
    }

    const orderUserId = customData.user_id
    const sku = customData.sku
    if (!orderUserId || !sku) {
      return NextResponse.json({ error: "Missing user_id or sku in custom_id" }, { status: 400 })
    }
    if (orderUserId !== user.id) {
      return NextResponse.json({ error: "Order owner mismatch" }, { status: 403 })
    }

    const catalogItem = PAYPAL_CATALOG[sku as PayPalSku]
    if (!catalogItem) {
      return NextResponse.json({ error: "Invalid sku in custom_id" }, { status: 400 })
    }

    const { value: capturedAmount, currency: capturedCurrency } = extractCapturedAmount(result)
    const expectedAmount = Number(catalogItem.amount.toFixed(2))
    if (capturedAmount !== null && Math.abs(capturedAmount - expectedAmount) > 0.001) {
      return NextResponse.json({ error: "Captured amount mismatch" }, { status: 400 })
    }
    if (capturedCurrency && capturedCurrency !== catalogItem.currencyCode) {
      return NextResponse.json({ error: "Captured currency mismatch" }, { status: 400 })
    }

    const admin = getSupabaseAdminClient() as any
    const { error: updateError } = await admin
      .from("payment_orders")
      .update({
        status: "captured",
        captured_at: new Date().toISOString(),
        paypal_capture_payload: result,
      })
      .eq("paypal_order_id", body.orderId)
      .eq("user_id", user.id)

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update order status: ${updateError.message}` },
        { status: 500 },
      )
    }

    return NextResponse.json({
      paypal: result,
      sku,
      kind: catalogItem.kind,
      status: "captured_awaiting_webhook",
      message: "Payment captured. Credits will be granted after webhook verification.",
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
