"use client"

import { Check, CreditCard, ShieldCheck, Sparkles } from "lucide-react"

import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PayPalCheckoutDialog } from "@/components/paypal-checkout-dialog"

type Plan = {
  name: string
  description: string
  priceLabel: string
  amount?: number
  badge?: string
  highlighted?: boolean
  features: string[]
  ctaLabel: string
  ctaType: "paypal" | "link"
  href?: string
}

function FeatureList({ features }: { features: string[] }) {
  return (
    <ul className="space-y-3 text-sm">
      {features.map((f) => (
        <li key={f} className="flex items-start gap-2 text-muted-foreground">
          <Check className="mt-0.5 size-4 shrink-0 text-primary" />
          <span className="text-foreground/90">{f}</span>
        </li>
      ))}
    </ul>
  )
}

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-border/60 bg-card/60 backdrop-blur-xl",
        plan.highlighted && "border-primary/40"
      )}
    >
      {plan.highlighted ? (
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent"
          aria-hidden="true"
        />
      ) : null}

      <CardHeader className="relative gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <CardTitle className="text-xl">{plan.name}</CardTitle>
            <div className="mt-1 text-sm text-muted-foreground">
              {plan.description}
            </div>
          </div>
          {plan.badge ? (
            <Badge className="shrink-0" variant={plan.highlighted ? "default" : "secondary"}>
              {plan.badge}
            </Badge>
          ) : null}
        </div>

        <div className="flex items-end gap-2">
          <div className="text-3xl font-semibold tracking-tight">
            {plan.priceLabel}
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative">
        <Separator className="mb-6 opacity-60" />
        <FeatureList features={plan.features} />
      </CardContent>

      <CardFooter className="relative">
        {plan.ctaType === "paypal" && typeof plan.amount === "number" ? (
          <PayPalCheckoutDialog
            title={plan.name}
            description={plan.description}
            amount={plan.amount}
            buttonLabel={plan.ctaLabel}
            className="w-full"
          />
        ) : (
          <Button asChild variant={plan.highlighted ? "default" : "outline"} className="w-full">
            <a href={plan.href ?? "/account"}>{plan.ctaLabel}</a>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

export function PricingPageV2() {
  const { locale } = useI18n()
  const isZh = locale === "zh"

  const header = {
    title: isZh ? "价格方案" : "Pricing",
    subtitle: isZh
      ? "订阅与点数包，均可通过 PayPal 安全结账（当前默认沙箱环境）。"
      : "Subscriptions and credit packs. Secure checkout with PayPal (sandbox by default).",
  }

  const subscriptionPlans: Plan[] = [
    {
      name: isZh ? "免费版" : "Free",
      description: isZh ? "快速体验 Sakura AI" : "Try Sakura AI quickly",
      priceLabel: "$0",
      features: [
        isZh ? "基础图片编辑" : "Basic image editing",
        isZh ? "标准队列" : "Standard queue",
        isZh ? "社区支持" : "Community support",
      ],
      ctaLabel: isZh ? "开始使用" : "Get started",
      ctaType: "link",
      href: "/account",
    },
    {
      name: isZh ? "专业版" : "Pro",
      description: isZh ? "更快处理 + 优先支持" : "Priority processing + support",
      priceLabel: "$0.99",
      amount: 0.99,
      badge: isZh ? "推荐" : "Popular",
      highlighted: true,
      features: [
        isZh ? "更高优先级队列" : "Higher priority queue",
        isZh ? "更稳定的生成体验" : "More stable generation",
        isZh ? "优先支持" : "Priority support",
      ],
      ctaLabel: isZh ? "PayPal 结账" : "Checkout with PayPal",
      ctaType: "paypal",
    },
    {
      name: isZh ? "企业版" : "Business",
      description: isZh ? "团队与定制需求" : "Teams and custom needs",
      priceLabel: isZh ? "定制" : "Custom",
      features: [
        isZh ? "团队管理" : "Team management",
        isZh ? "发票与对公支持" : "Invoices & business support",
        isZh ? "定制集成" : "Custom integrations",
      ],
      ctaLabel: isZh ? "联系销售" : "Contact sales",
      ctaType: "link",
      href: "mailto:billing@sakura-ai.example?subject=Sakura%20AI%20Business%20Pricing",
    },
  ]

  const packPlans: Plan[] = [
    {
      name: isZh ? "入门点数包" : "Starter Pack",
      description: isZh ? "适合试用与轻度使用" : "Best for light usage",
      priceLabel: isZh ? "200 点" : "200 credits",
      amount: 0.99,
      features: [
        isZh ? "一次性购买，无自动续费" : "One-time purchase, no auto-renew",
        isZh ? "点数不过期" : "Credits never expire",
        isZh ? "解锁核心功能" : "Unlock core features",
      ],
      ctaLabel: isZh ? "PayPal 购买" : "Buy with PayPal",
      ctaType: "paypal",
    },
    {
      name: isZh ? "成长点数包" : "Growth Pack",
      description: isZh ? "适合日常创作" : "For regular creators",
      priceLabel: isZh ? "600 点" : "600 credits",
      amount: 4.99,
      badge: isZh ? "最热门" : "Most popular",
      highlighted: true,
      features: [
        isZh ? "一次性购买，无自动续费" : "One-time purchase, no auto-renew",
        isZh ? "点数不过期" : "Credits never expire",
        isZh ? "更高处理优先级" : "Higher processing priority",
      ],
      ctaLabel: isZh ? "PayPal 购买" : "Buy with PayPal",
      ctaType: "paypal",
    },
    {
      name: isZh ? "专业点数包" : "Pro Pack",
      description: isZh ? "高频使用" : "For heavy usage",
      priceLabel: isZh ? "1500 点" : "1500 credits",
      amount: 9.99,
      features: [
        isZh ? "一次性购买，无自动续费" : "One-time purchase, no auto-renew",
        isZh ? "点数不过期" : "Credits never expire",
        isZh ? "优先支持" : "Priority support",
      ],
      ctaLabel: isZh ? "PayPal 购买" : "Buy with PayPal",
      ctaType: "paypal",
    },
  ]

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute top-0 left-1/2 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-20 lg:px-8 lg:pb-28">
        <section className="py-10 lg:py-14">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="outline"
              className="mb-4 border-primary/30 bg-primary/5 text-primary"
            >
              <Sparkles className="mr-1.5 size-3.5" />
              {header.title}
            </Badge>
            <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
              {header.title}
            </h1>
            <p className="mt-4 text-pretty text-base text-muted-foreground md:text-lg">
              {header.subtitle}
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-5xl rounded-xl border border-primary/15 bg-card/60 p-5 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ShieldCheck className="size-4 text-primary" />
              {isZh ? "安全结账" : "Secure checkout"}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CreditCard className="size-3.5" />
                PayPal Checkout
              </span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="packs" className="mx-auto mt-8 max-w-5xl">
          <div className="flex items-center justify-center">
            <TabsList>
              <TabsTrigger value="subscriptions">
                {isZh ? "订阅" : "Subscriptions"}
              </TabsTrigger>
              <TabsTrigger value="packs">{isZh ? "点数包" : "Credit Packs"}</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="subscriptions" className="mt-8">
            <div className="grid gap-5 md:grid-cols-3">
              {subscriptionPlans.map((p) => (
                <PlanCard key={p.name} plan={p} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="packs" className="mt-8">
            <div className="grid gap-5 md:grid-cols-3">
              {packPlans.map((p) => (
                <PlanCard key={p.name} plan={p} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

