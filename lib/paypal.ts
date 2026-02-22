type PayPalEnv = "sandbox" | "live"

function getPayPalEnv(): PayPalEnv {
  const env = (process.env.PAYPAL_ENV ?? "sandbox").toLowerCase()
  return env === "live" ? "live" : "sandbox"
}

function getApiBaseUrl(): string {
  return getPayPalEnv() === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com"
}

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env: ${name}`)
  return v
}

async function getAccessToken(): Promise<string> {
  const clientId = requireEnv("PAYPAL_CLIENT_ID")
  const clientSecret = requireEnv("PAYPAL_CLIENT_SECRET")

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

  const res = await fetch(`${getApiBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    // Avoid Next caching for token requests
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`PayPal token error (${res.status}): ${text}`)
  }

  const json = (await res.json()) as { access_token?: string }
  if (!json.access_token) throw new Error("PayPal token error: no access_token")
  return json.access_token
}

export async function paypalCreateOrder(input: {
  amount: string
  currencyCode: string
  description?: string
}) {
  const accessToken = await getAccessToken()

  const res = await fetch(`${getApiBaseUrl()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          description: input.description,
          amount: {
            currency_code: input.currencyCode,
            value: input.amount,
          },
        },
      ],
    }),
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`PayPal create order error (${res.status}): ${text}`)
  }

  const json = (await res.json()) as { id?: string }
  if (!json.id) throw new Error("PayPal create order error: no id")
  return json
}

export async function paypalCaptureOrder(orderId: string) {
  const accessToken = await getAccessToken()

  const res = await fetch(
    `${getApiBaseUrl()}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  )

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`PayPal capture error (${res.status}): ${text}`)
  }

  return res.json()
}

