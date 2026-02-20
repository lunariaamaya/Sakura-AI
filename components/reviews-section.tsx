"use client"

import { useI18n } from "@/lib/i18n"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"

export function ReviewsSection() {
  const { t } = useI18n()

  const reviews = [1, 2, 3].map((i) => ({
    name: t(`reviews.${i}.name`),
    role: t(`reviews.${i}.role`),
    text: t(`reviews.${i}.text`),
    initial: t(`reviews.${i}.name`).charAt(0).toUpperCase(),
  }))

  return (
    <section id="reviews" className="relative py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute top-1/3 left-1/3 size-[400px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-14 text-center">
          <Badge
            variant="outline"
            className="mb-4 border-primary/30 bg-primary/5 text-primary"
          >
            {t("reviews.label")}
          </Badge>
          <h2 className="mb-4 text-balance text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            {t("reviews.title")}
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {reviews.map((review, i) => (
            <div
              key={i}
              className="relative rounded-2xl border border-primary/10 bg-card/60 p-6 backdrop-blur-xl transition-all duration-300 hover:border-primary/30"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                  {review.initial}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{review.name}</p>
                  <p className="text-xs text-muted-foreground">{review.role}</p>
                </div>
              </div>
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="size-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {`"${review.text}"`}
              </p>

              {/* Decorative sakura */}
              <div className="pointer-events-none absolute -top-2 -right-2 opacity-10" aria-hidden="true">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2C12 2 8 6 8 10C8 12.5 9.5 14 12 14C14.5 14 16 12.5 16 10C16 6 12 2 12 2Z"
                    fill="#f9a8d4"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
