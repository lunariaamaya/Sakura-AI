export type PayPalSku =
  | "credits-starter-200"
  | "credits-growth-600"
  | "credits-pro-1500"
  | "sub-pro-monthly"
  | "sub-pro-yearly"
  | "sub-max-monthly"
  | "sub-max-yearly"

type CatalogItem = {
  amount: number
  currencyCode: "USD"
  credits: number
  description: string
  kind: "credits_pack" | "subscription"
}

export const PAYPAL_CATALOG: Record<PayPalSku, CatalogItem> = {
  "credits-starter-200": {
    amount: 4.99,
    currencyCode: "USD",
    credits: 750,
    description: "Small Pack (750 credits)",
    kind: "credits_pack",
  },
  "credits-growth-600": {
    amount: 12.99,
    currencyCode: "USD",
    credits: 2500,
    description: "Advanced Pack (2500 credits)",
    kind: "credits_pack",
  },
  "credits-pro-1500": {
    amount: 34.99,
    currencyCode: "USD",
    credits: 9000,
    description: "Pro Pack (9000 credits)",
    kind: "credits_pack",
  },
  "sub-pro-monthly": {
    amount: 14.9,
    currencyCode: "USD",
    credits: 5000,
    description: "Pro Subscription Monthly (5000 credits)",
    kind: "subscription",
  },
  "sub-pro-yearly": {
    amount: 118.8,
    currencyCode: "USD",
    credits: 60000,
    description: "Pro Subscription Yearly (60000 credits)",
    kind: "subscription",
  },
  "sub-max-monthly": {
    amount: 39.9,
    currencyCode: "USD",
    credits: 17500,
    description: "Max Subscription Monthly (17500 credits)",
    kind: "subscription",
  },
  "sub-max-yearly": {
    amount: 358.8,
    currencyCode: "USD",
    credits: 210000,
    description: "Max Subscription Yearly (210000 credits)",
    kind: "subscription",
  },
}
