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
    amount: 4.99,
    currencyCode: "USD",
    credits: 750,
    description: "Small Pack (750 credits)",
  },
  "credits-growth-600": {
    amount: 12.99,
    currencyCode: "USD",
    credits: 2500,
    description: "Advanced Pack (2500 credits)",
  },
  "credits-pro-1500": {
    amount: 34.99,
    currencyCode: "USD",
    credits: 9000,
    description: "Pro Pack (9000 credits)",
  },
}
