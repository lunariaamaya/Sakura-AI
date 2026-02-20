"use client"

import { useI18n } from "@/lib/i18n"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"

export function FaqSection() {
  const { t } = useI18n()

  const faqItems = [1, 2, 3, 4, 5].map((i) => ({
    q: t(`faq.${i}.q`),
    a: t(`faq.${i}.a`),
  }))

  return (
    <section id="faq" className="relative py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute right-1/4 bottom-1/4 size-[400px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 lg:px-8">
        <div className="mb-14 text-center">
          <Badge
            variant="outline"
            className="mb-4 border-primary/30 bg-primary/5 text-primary"
          >
            {t("faq.label")}
          </Badge>
          <h2 className="mb-4 text-balance text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            {t("faq.title")}
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqItems.map((item, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="overflow-hidden rounded-xl border border-primary/10 bg-card/60 px-6 backdrop-blur-xl"
            >
              <AccordionTrigger className="py-5 text-left text-base font-medium text-foreground hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
