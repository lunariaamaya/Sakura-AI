import type { Metadata } from "next"

import { SakuraPetals } from "@/components/sakura-petals"
import { PricingPageV2 } from "@/components/pricing-page-v2"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Pricing - Sakura AI",
  description:
    "Pick a plan and checkout securely with PayPal (sandbox/live supported).",
  alternates: {
    canonical: "/pricing-v2",
  },
}

export default function PricingV2Page() {
  return (
    <>
      <SakuraPetals />
      <main className="pt-24">
        <PricingPageV2 />
      </main>
      <Footer />
    </>
  )
}
