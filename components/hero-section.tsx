"use client"

import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles } from "lucide-react"

export function HeroSection() {
  const { t } = useI18n()

  return (
    <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden pt-16">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute top-1/4 left-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/4 size-[400px] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center lg:px-8">
        <Badge
          variant="outline"
          className="mb-6 gap-1.5 border-primary/30 bg-primary/5 px-4 py-1.5 text-primary"
        >
          <Sparkles className="size-3.5" />
          {t("hero.badge")}
        </Badge>

        <h1 className="mb-6 text-balance text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl">
          {t("hero.title")}
          <br />
          <span className="text-primary">{t("hero.title2")}</span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
          {t("hero.desc")}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" className="gap-2 px-8 text-base" asChild>
            <a href="#editor">
              {t("hero.cta")}
              <ArrowRight className="size-4" />
            </a>
          </Button>
          <Button size="lg" variant="outline" className="gap-2 px-8 text-base" asChild>
            <a href="#showcase">
              {t("hero.cta2")}
            </a>
          </Button>
        </div>

        {/* Decorative sakura branches */}
        <div className="pointer-events-none absolute -top-10 -right-10 opacity-20" aria-hidden="true">
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
            <path d="M180 20C150 40 120 60 100 100C80 140 60 170 20 180" stroke="#f9a8d4" strokeWidth="1" />
            <circle cx="160" cy="30" r="8" fill="#f9a8d4" opacity="0.4" />
            <circle cx="130" cy="50" r="6" fill="#fda4af" opacity="0.3" />
            <circle cx="110" cy="80" r="7" fill="#fbcfe8" opacity="0.3" />
            <circle cx="85" cy="115" r="5" fill="#f9a8d4" opacity="0.2" />
          </svg>
        </div>
        <div className="pointer-events-none absolute -bottom-10 -left-10 opacity-20" aria-hidden="true">
          <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
            <path d="M20 140C50 120 80 100 100 70C120 40 130 20 140 10" stroke="#f9a8d4" strokeWidth="1" />
            <circle cx="40" cy="130" r="6" fill="#fda4af" opacity="0.3" />
            <circle cx="70" cy="105" r="7" fill="#f9a8d4" opacity="0.4" />
            <circle cx="100" cy="70" r="5" fill="#fbcfe8" opacity="0.3" />
          </svg>
        </div>
      </div>
    </section>
  )
}
