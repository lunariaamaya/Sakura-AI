import { SakuraPetals } from "@/components/sakura-petals"
import { HeroSection } from "@/components/hero-section"
import { EditorSection } from "@/components/editor-section"
import { FeaturesSection } from "@/components/features-section"
import { ShowcaseSection } from "@/components/showcase-section"
import { ReviewsSection } from "@/components/reviews-section"
import { FaqSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
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
