import { redirect } from "next/navigation"

import { SakuraPetals } from "@/components/sakura-petals"
import { HeroSection } from "@/components/hero-section"
import { EditorSection } from "@/components/editor-section"
import { FeaturesSection } from "@/components/features-section"
import { ShowcaseSection } from "@/components/showcase-section"
import { ReviewsSection } from "@/components/reviews-section"
import { FaqSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"

type SearchParams = Record<string, string | string[] | undefined>

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams | Promise<SearchParams>
}) {
  const params = await Promise.resolve(searchParams)
  const code = first(params.code)
  const error = first(params.error)

  // Fallback for providers that redirect to "/" with OAuth params.
  if (code || error) {
    const callbackParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (!value) return
      if (Array.isArray(value)) {
        value.forEach((item) => callbackParams.append(key, item))
        return
      }
      callbackParams.set(key, value)
    })
    redirect(`/auth/callback?${callbackParams.toString()}`)
  }

  return (
    <>
      <SakuraPetals />
      <main>
        <HeroSection />
        <EditorSection />
        <FeaturesSection />
        <ShowcaseSection />
        <ReviewsSection />
        <FaqSection />
      </main>
      <Footer />
    </>
  )
}
