"use client"

import { useI18n } from "@/lib/i18n"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, ArrowRight } from "lucide-react"

const showcaseItems = [
  { image: "/images/showcase-mountain.svg", titleKey: "showcase.1.title", descKey: "showcase.1.desc" },
  { image: "/images/showcase-garden.svg", titleKey: "showcase.2.title", descKey: "showcase.2.desc" },
  { image: "/images/showcase-beach.svg", titleKey: "showcase.3.title", descKey: "showcase.3.desc" },
  { image: "/images/showcase-aurora.svg", titleKey: "showcase.4.title", descKey: "showcase.4.desc" },
]

export function ShowcaseSection() {
  const { t } = useI18n()

  return (
    <section id="showcase" className="relative py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute right-0 bottom-0 size-[500px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-14 text-center">
          <Badge
            variant="outline"
            className="mb-4 border-primary/30 bg-primary/5 text-primary"
          >
            {t("showcase.label")}
          </Badge>
          <h2 className="mb-4 text-balance text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            {t("showcase.title")}
          </h2>
          <p className="mx-auto max-w-xl text-pretty text-muted-foreground">
            {t("showcase.desc")}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {showcaseItems.map((item, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-primary/10 bg-card/60 backdrop-blur-xl transition-all duration-300 hover:border-primary/30"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={item.image}
                  alt={t(item.titleKey)}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5">
                <div className="mb-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                    <Zap className="size-3" />
                    {t("showcase.speed")}
                  </span>
                </div>
                <h3 className="mb-1 text-base font-semibold text-foreground">
                  {t(item.titleKey)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(item.descKey)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button size="lg" className="gap-2" asChild>
            <a href="#editor">
              {t("showcase.cta")}
              <ArrowRight className="size-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
