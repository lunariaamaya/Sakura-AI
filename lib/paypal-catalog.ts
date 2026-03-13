export type PayPalSku =
  | "credits-starter-200"
  | "credits-growth-600"
  | "credits-pro-1500"

type CatalogItem = {
  amount: number
  currencyCode: "USD"
  credits: number
  description: string
}

export const PAYPAL_CATALOG: Record<PayPalSku, CatalogItem> = {
  "credits-starter-200": {
    amount: 0.99,
    currencyCode: "USD",
    credits: 200,
    description: "Starter Pack (200 credits)",
  },
  "credits-growth-600": {
    amount: 4.99,
    currencyCode: "USD",
    credits: 600,
    description: "Growth Pack (600 credits)",
  },
  "credits-pro-1500": {
    amount: 9.99,
    currencyCode: "USD",
    credits: 1500,
    description: "Pro Pack (1500 credits)",
  },
}
