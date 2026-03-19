// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

type PayPalEvent = {
  id?: string
  event_type?: string
  resource?: Record<string, JsonValue>
}

function json(status: number, payload: Record<string, JsonValue>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  })
}

function getPaypalBaseUrl() {
  const mode = (Deno.env.get("PAYPAL_ENV") ?? Deno.env.get("PAYPAL_MODE") ?? "sandbox").toLowerCase()
  return mode === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com"
}

function requiredEnv(name: string) {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`Missing env: ${name}`)
  return value
}

function getPaypalCredentials() {
  return {
    clientId: Deno.env.get("PAYPAL_CLIENT_ID") ?? requiredEnv("NEXT_PUBLIC_PAYPAL_CLIENT_ID"),
    clientSecret: Deno.env.get("PAYPAL_CLIENT_SECRET") ?? requiredEnv("PAYPAL_SECRET"),
    webhookId: requiredEnv("PAYPAL_WEBHOOK_ID"),
  }
}

async function getPaypalAccessToken() {
  const { clientId, clientSecret } = getPaypalCredentials()
  const auth = btoa(`${clientId}:${clientSecret}`)
  const response = await fetch(`${getPaypalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`PayPal token failed: ${response.status} ${detail}`)
  }

  const data = (await response.json()) as { access_token?: string }
  if (!data.access_token) throw new Error("PayPal token missing access_token")
  return data.access_token
}

async function paypalFetch(path: string, init: RequestInit = {}) {
  const token = await getPaypalAccessToken()
  return fetch(`${getPaypalBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  })
}

function getOrderIdFromEvent(event: PayPalEvent) {
  const resource = event.resource ?? {}
  if (
    event.event_type === "CHECKOUT.ORDER.COMPLETED" &&
    typeof resource.id === "string" &&
    resource.id.length > 0
  ) {
    return resource.id
  }

  const relatedOrderId =
    (resource.supplementary_data as Record<string, JsonValue> | undefined)
      ?.related_ids as Record<string, JsonValue> | undefined
  if (typeof relatedOrderId?.order_id === "string" && relatedOrderId.order_id.length > 0) {
    return relatedOrderId.order_id
  }

  return null
}

function toTwoDecimalNumber(value: unknown) {
  if (typeof value === "number") return Number(value.toFixed(2))
  if (typeof value !== "string") return null
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return null
  return Number(parsed.toFixed(2))
}

function extractOrderMoney(orderPayload: any) {
  const unit = Array.isArray(orderPayload?.purchase_units) ? orderPayload.purchase_units[0] : null
  const capture =
    Array.isArray(unit?.payments?.captures) && unit.payments.captures.length > 0
      ? unit.payments.captures[0]
      : null

  const amount = toTwoDecimalNumber(capture?.amount?.value ?? unit?.amount?.value)
  const currency = (capture?.amount?.currency_code ?? unit?.amount?.currency_code ?? null) as string | null
  const customId = (unit?.custom_id ?? null) as string | null

  return { amount, currency, customId }
}

async function verifyWebhookSignature(event: PayPalEvent, request: Request) {
  const { webhookId } = getPaypalCredentials()
  const authAlgo = request.headers.get("paypal-auth-algo")
  const certUrl = request.headers.get("paypal-cert-url")
  const transmissionId = request.headers.get("paypal-transmission-id")
  const transmissionSig = request.headers.get("paypal-transmission-sig")
  const transmissionTime = request.headers.get("paypal-transmission-time")

  if (!authAlgo || !certUrl || !transmissionId || !transmissionSig || !transmissionTime) {
    return false
  }

  const response = await paypalFetch("/v1/notifications/verify-webhook-signature", {
    method: "POST",
    body: JSON.stringify({
      auth_algo: authAlgo,
      cert_url: certUrl,
      transmission_id: transmissionId,
      transmission_sig: transmissionSig,
      transmission_time: transmissionTime,
      webhook_id: webhookId,
      webhook_event: event,
    }),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`PayPal signature verification failed: ${response.status} ${detail}`)
  }

  const data = (await response.json()) as { verification_status?: string }
  return data.verification_status === "SUCCESS"
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return json(405, { ok: false, error: "Method not allowed" })
  }

  let event: PayPalEvent
  try {
    event = (await request.json()) as PayPalEvent
  } catch {
    return json(400, { ok: false, error: "Invalid JSON payload" })
  }

  try {
    const verified = await verifyWebhookSignature(event, request)
    if (!verified) {
      return json(401, { ok: false, error: "Invalid PayPal webhook signature" })
    }

    const eventType = event.event_type ?? "UNKNOWN"
    if (eventType !== "CHECKOUT.ORDER.COMPLETED" && eventType !== "PAYMENT.CAPTURE.COMPLETED") {
      return json(200, { ok: true, ignored: true, reason: `Unhandled event: ${eventType}` })
    }

    const orderId = getOrderIdFromEvent(event)
    if (!orderId) {
      return json(200, { ok: true, ignored: true, reason: "No order_id in webhook event" })
    }

    const supabase = createClient(requiredEnv("SUPABASE_URL"), requiredEnv("SUPABASE_SERVICE_ROLE_KEY"), {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data: paymentOrder, error: readError } = await supabase
      .from("payment_orders")
      .select("*")
      .eq("paypal_order_id", orderId)
      .maybeSingle()

    if (readError) {
      throw new Error(`Read payment_orders failed: ${readError.message}`)
    }
    if (!paymentOrder) {
      return json(200, { ok: true, ignored: true, reason: "Unknown order", orderId })
    }

    const orderResponse = await paypalFetch(`/v2/checkout/orders/${orderId}`, { method: "GET" })
    if (!orderResponse.ok) {
      const detail = await orderResponse.text()
      throw new Error(`Read PayPal order failed: ${orderResponse.status} ${detail}`)
    }

    const orderPayload = await orderResponse.json()
    const { amount, currency, customId } = extractOrderMoney(orderPayload)
    const expectedAmount = toTwoDecimalNumber(paymentOrder.expected_amount)
    const expectedCurrency = paymentOrder.expected_currency as string

    const amountMismatch =
      amount === null || expectedAmount === null || currency !== expectedCurrency || amount !== expectedAmount
    const customIdMismatch = !customId || customId !== paymentOrder.paypal_custom_id

    if (amountMismatch || customIdMismatch) {
      await supabase
        .from("payment_orders")
        .update({
          status: "failed",
          paypal_event_payload: event,
        })
        .eq("paypal_order_id", orderId)

      return json(200, { ok: true, ignored: true, reason: "Webhook validation mismatch", orderId })
    }

    const { data: rpcResult, error: rpcError } = await supabase.rpc("apply_paypal_order_credit", {
      p_paypal_order_id: orderId,
      p_paypal_event_payload: event,
    })

    if (rpcError) {
      throw new Error(`apply_paypal_order_credit failed: ${rpcError.message}`)
    }

    return json(200, {
      ok: true,
      orderId,
      eventType,
      result: rpcResult as JsonValue,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown webhook error"
    return json(500, { ok: false, error: message })
  }
})
