import type { Metadata } from "next"

import { SakuraPetals } from "@/components/sakura-petals"
import { PricingPage } from "@/components/pricing-page"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Pricing - Sakura AI",
  description:
    "Choose a Sakura AI plan that fits your workflow. Pay securely with PayPal.",
  alternates: {
    canonical: "/pricing",
  },
}

export default function Pricing() {
  return (
    <>
      <SakuraPetals />
      <main className="pt-24">
        <PricingPage />
      </main>
      <Footer />
    </>
  )
}
