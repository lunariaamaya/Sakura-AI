"use client"

import { useState } from "react"
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
  priceMain: string
  priceSuffix?: string
  priceDetail?: string
  amount?: number
  sku?: string
  badge?: string
  highlighted?: boolean
  features: string[]
  ctaLabel: string
  ctaType: "paypal" | "link"
  href?: string
}

type BillingCycle = "monthly" | "yearly"

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
        "relative flex h-full flex-col overflow-hidden border-border/60 bg-card/60 backdrop-blur-xl",
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

        <div>
          <div className="flex items-end gap-1.5">
            <div className="text-3xl font-semibold tracking-tight">{plan.priceMain}</div>
            {plan.priceSuffix ? (
              <div className="pb-1 text-sm text-muted-foreground/80">{plan.priceSuffix}</div>
            ) : null}
          </div>
          {plan.priceDetail ? (
            <div className="mt-1 text-xs text-muted-foreground/80">{plan.priceDetail}</div>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="relative flex-1">
        <Separator className="mb-6 opacity-60" />
        <FeatureList features={plan.features} />
      </CardContent>

      <CardFooter className="relative mt-auto">
        {plan.ctaType === "paypal" && typeof plan.amount === "number" ? (
          <PayPalCheckoutDialog
            title={plan.name}
            description={plan.description}
            amount={plan.amount}
            sku={plan.sku ?? ""}
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
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly")

  const header = {
    title: isZh ? "价格方案" : "Pricing",
    subtitle: isZh
      ? "订阅与点数包。价格单位：USD。"
      : "Subscriptions and credit packs. All prices are in USD.",
  }

  const subscriptionPlans: Plan[] = [
    {
      name: isZh ? "免费" : "Free",
      description: isZh ? "每日免费额度" : "Daily free credits",
      priceMain: "$0",
      features: [
        isZh
          ? "每日刷新 100 积分（约 2 次图片生成）"
          : "100 credits refreshed daily (about 2 image generations)",
        isZh ? "基础图像编辑" : "Basic image editing",
        isZh ? "标准队列" : "Standard queue",
      ],
      ctaLabel: isZh ? "开始使用" : "Get started",
      ctaType: "link",
      href: "/account",
    },
    {
      name: "Pro",
      description: isZh ? "适合高频创作" : "For frequent creators",
      priceMain: billingCycle === "monthly" ? "$14.9" : "$118.8",
      priceSuffix: billingCycle === "monthly" ? (isZh ? "/月" : "/Monthly") : isZh ? "/按年" : "/yearly",
      priceDetail:
        billingCycle === "yearly"
          ? isZh
            ? "每月仅9.9$"
            : "Only $9.9/month"
          : undefined,
      badge: isZh ? "推荐" : "Popular",
      highlighted: true,
      features: [
        isZh ? "每月 5000 积分" : "5000 credits per month",
        isZh ? "按月重置积分" : "Monthly credit reset",
        isZh ? "优先支持" : "Priority support",
      ],
      ctaLabel: isZh ? "升级订阅" : "Upgrade subscription",
      ctaType: "link",
      href: "/account",
    },
    {
      name: "Max",
      description: isZh ? "适合重度使用" : "For heavy usage",
      priceMain: billingCycle === "monthly" ? "$39.9" : "$358.8",
      priceSuffix: billingCycle === "monthly" ? (isZh ? "/月" : "/Monthly") : isZh ? "/按年" : "/yearly",
      priceDetail:
        billingCycle === "yearly"
          ? isZh
            ? "每月仅29.9$"
            : "Only $29.9/month"
          : undefined,
      features: [
        isZh ? "每月 17500 积分" : "17500 credits per month",
        isZh ? "按月重置积分" : "Monthly credit reset",
        isZh ? "优先支持" : "Priority support",
      ],
      ctaLabel: isZh ? "升级订阅" : "Upgrade subscription",
      ctaType: "link",
      href: "/account",
    },
  ]

  const packPlans: Plan[] = [
    {
      name: isZh ? "小额包" : "Small Pack",
      description: isZh ? "一次性购买" : "One-time purchase",
      priceMain: "$4.99",
      amount: 4.99,
      sku: "credits-starter-200",
      features: [
        isZh ? "750 积分" : "750 credits",
        isZh ? "一次性购买，无自动续费" : "One-time purchase, no auto-renew",
        isZh ? "点数永不过期" : "Credits never expire",
      ],
      ctaLabel: isZh ? "PayPal 购买" : "Buy with PayPal",
      ctaType: "paypal",
    },
    {
      name: isZh ? "进阶包" : "Advanced Pack",
      description: isZh ? "一次性购买" : "One-time purchase",
      priceMain: "$12.99",
      amount: 12.99,
      sku: "credits-growth-600",
      badge: isZh ? "最热门" : "Most popular",
      highlighted: true,
      features: [
        isZh ? "2500 积分" : "2500 credits",
        isZh ? "一次性购买，无自动续费" : "One-time purchase, no auto-renew",
        isZh ? "点数永不过期" : "Credits never expire",
      ],
      ctaLabel: isZh ? "PayPal 购买" : "Buy with PayPal",
      ctaType: "paypal",
    },
    {
      name: isZh ? "专业包" : "Pro Pack",
      description: isZh ? "一次性购买" : "One-time purchase",
      priceMain: "$34.99",
      amount: 34.99,
      sku: "credits-pro-1500",
      features: [
        isZh ? "9000 积分" : "9000 credits",
        isZh ? "一次性购买，无自动续费" : "One-time purchase, no auto-renew",
        isZh ? "点数永不过期" : "Credits never expire",
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
              {isZh ? "安全结算" : "Secure checkout"}
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
            <div className="mb-5 flex justify-center">
              <div className="inline-flex rounded-lg border border-border/60 bg-secondary/50 p-1">
                <button
                  type="button"
                  onClick={() => setBillingCycle("monthly")}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm transition-colors",
                    billingCycle === "monthly"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {isZh ? "按月付费" : "Monthly"}
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle("yearly")}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm transition-colors",
                    billingCycle === "yearly"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {isZh ? "按年付费" : "Yearly"}
                </button>
              </div>
            </div>

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
