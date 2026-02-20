"use client"

import { I18nProvider } from "@/lib/i18n"
import { SakuraPetals } from "@/components/sakura-petals"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { EditorSection } from "@/components/editor-section"
import { FeaturesSection } from "@/components/features-section"
import { ShowcaseSection } from "@/components/showcase-section"
import { ReviewsSection } from "@/components/reviews-section"
import { FaqSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <I18nProvider>
      <SakuraPetals />
      <Navbar />
      <main>
        <HeroSection />
        <EditorSection />
        <FeaturesSection />
        <ShowcaseSection />
        <ReviewsSection />
        <FaqSection />
      </main>
      <Footer />
    </I18nProvider>
  )
}
