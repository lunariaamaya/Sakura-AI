"use client"

import { useI18n } from "@/lib/i18n"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, User, Layers, Zap, Images, Palette } from "lucide-react"

const featureIcons = [MessageSquare, User, Layers, Zap, Images, Palette]

export function FeaturesSection() {
  const { t } = useI18n()

  const features = Array.from({ length: 6 }, (_, i) => ({
    icon: featureIcons[i],
    title: t(`features.${i + 1}.title`),
    desc: t(`features.${i + 1}.desc`),
  }))

  return (
    <section id="features" className="relative py-20 lg:py-28">
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute top-1/2 left-0 size-[500px] -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-14 text-center">
          <Badge
            variant="outline"
            className="mb-4 border-primary/30 bg-primary/5 text-primary"
          >
            {t("features.label")}
          </Badge>
          <h2 className="mb-4 text-balance text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            {t("features.title")}
          </h2>
          <p className="mx-auto max-w-xl text-pretty text-muted-foreground">
            {t("features.desc")}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <div
                key={i}
                className="group rounded-2xl border border-primary/10 bg-card/60 p-6 backdrop-blur-xl transition-all duration-300 hover:border-primary/30 hover:bg-primary/5"
              >
                <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary/20">
                  <Icon className="size-5" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.desc}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
