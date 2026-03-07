"use client"

import { Check, Mail, ShieldCheck, Sparkles } from "lucide-react"

import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const PAYPAL_CHECKOUT_URL = "https://www.paypal.com/ncp/payment/E49WZPZS3ERBU"

type Plan = {
  name: string
  description: string
  price: string
  priceHint?: string
  badge?: string
  features: string[]
  ctaLabel: string
  ctaHref: string
  ctaExternal?: boolean
  highlighted?: boolean
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
          <div className="text-3xl font-semibold tracking-tight">{plan.price}</div>
          {plan.priceHint ? (
            <div className="pb-1 text-sm text-muted-foreground">{plan.priceHint}</div>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="relative">
        <Separator className="mb-6 opacity-60" />
        <ul className="space-y-3 text-sm">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-muted-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              <span className="text-foreground/90">{f}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="relative">
        <Button
          asChild
          className="w-full"
          variant={plan.highlighted ? "default" : "outline"}
        >
          <a
            href={plan.ctaHref}
            target={plan.ctaExternal ? "_blank" : undefined}
            rel={plan.ctaExternal ? "noopener noreferrer" : undefined}
          >
            {plan.ctaLabel}
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}

export function PricingPage() {
  const { locale } = useI18n()
  const isZh = locale === "zh"

  const copy = {
    title: isZh ? "价格方案" : "Pricing",
    subtitle: isZh
      ? "选择适合你的方案，支持 PayPal 安全付款。"
      : "Choose a plan that fits your workflow. Pay securely with PayPal.",
    tabs: {
      subscriptions: isZh ? "订阅" : "Subscriptions",
      packs: isZh ? "点数包" : "Credit Packs",
    },
    note: isZh
      ? "当前版本会跳转到 PayPal 支付页面；自动开通和自动加点可在下一步接入。"
      : "For now, this button opens PayPal checkout; automatic unlock/crediting can be wired up next.",
  }

  const subscriptionPlans: Plan[] = [
    {
      name: isZh ? "免费版" : "Free",
      description: isZh ? "快速体验 Sakura AI" : "Try Sakura AI in minutes",
      price: "$0",
      priceHint: isZh ? "永久" : "forever",
      features: [
        isZh ? "基础图像编辑" : "Basic image editing",
        isZh ? "标准生成速度" : "Standard generation speed",
        isZh ? "社区支持" : "Community support",
      ],
      ctaLabel: isZh ? "开始使用" : "Get started",
      ctaHref: "/account",
      highlighted: false,
    },
    {
      name: isZh ? "专业版" : "Pro",
      description: isZh ? "更快、更稳、可商用" : "Faster workflows and commercial use",
      price: "$0.99",
      priceHint: isZh ? "一次性支付" : "one-time",
      badge: isZh ? "推荐" : "Popular",
      features: [
        isZh ? "更高优先级队列" : "Higher priority queue",
        isZh ? "商用授权" : "Commercial license",
        isZh ? "优先支持" : "Priority support",
      ],
      ctaLabel: isZh ? "使用 PayPal 购买" : "Buy with PayPal",
      ctaHref: PAYPAL_CHECKOUT_URL,
      ctaExternal: true,
      highlighted: true,
    },
    {
      name: isZh ? "企业版" : "Business",
      description: isZh ? "团队、定制需求与 SLA" : "Teams, custom needs, and SLAs",
      price: isZh ? "定制" : "Custom",
      features: [
        isZh ? "团队管理" : "Team management",
        isZh ? "发票与企业支持" : "Invoices and business support",
        isZh ? "专属集成与支持" : "Custom integrations and support",
      ],
      ctaLabel: isZh ? "联系销售" : "Contact sales",
      ctaHref: "mailto:billing@sakura-ai.example?subject=Sakura%20AI%20Business%20Pricing",
      ctaExternal: true,
      highlighted: false,
    },
  ]

  const packPlans: Plan[] = [
    {
      name: isZh ? "入门点数包" : "Starter Pack",
      description: isZh ? "适合试用与轻度使用" : "Great for trying things out",
      price: isZh ? "200 点" : "200 credits",
      priceHint: isZh ? "不过期" : "never expires",
      features: [
        isZh ? "一次性购买，无自动续费" : "One-time purchase, no auto-renew",
        isZh ? "解锁核心功能" : "Unlock core features",
        isZh ? "点数永不过期" : "Credits never expire",
      ],
      ctaLabel: isZh ? "用 PayPal 购买" : "Buy with PayPal",
      ctaHref: PAYPAL_CHECKOUT_URL,
      ctaExternal: true,
    },
    {
      name: isZh ? "成长点数包" : "Growth Pack",
      description: isZh ? "适合日常创作" : "For regular creators",
      price: isZh ? "600 点" : "600 credits",
      priceHint: isZh ? "不过期" : "never expires",
      badge: isZh ? "最热门" : "Most popular",
      features: [
        isZh ? "一次性购买，无自动续费" : "One-time purchase, no auto-renew",
        isZh ? "更高处理优先级" : "Higher processing priority",
        isZh ? "点数永不过期" : "Credits never expire",
      ],
      ctaLabel: isZh ? "用 PayPal 购买" : "Buy with PayPal",
      ctaHref: PAYPAL_CHECKOUT_URL,
      ctaExternal: true,
      highlighted: true,
    },
    {
      name: isZh ? "专业点数包" : "Pro Pack",
      description: isZh ? "高频使用与团队共享" : "Heavy usage and teams",
      price: isZh ? "1500 点" : "1500 credits",
      priceHint: isZh ? "不过期" : "never expires",
      features: [
        isZh ? "一次性购买，无自动续费" : "One-time purchase, no auto-renew",
        isZh ? "优先支持" : "Priority support",
        isZh ? "点数永不过期" : "Credits never expire",
      ],
      ctaLabel: isZh ? "用 PayPal 购买" : "Buy with PayPal",
      ctaHref: PAYPAL_CHECKOUT_URL,
      ctaExternal: true,
    },
  ]

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute top-0 left-1/2 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-20 lg:px-8 lg:pb-28">
        <section className="py-10 lg:py-14">
          <div className="mx-auto max-w-2xl text-center">
            <Badge
              variant="outline"
              className="mb-4 border-primary/30 bg-primary/5 text-primary"
            >
              <Sparkles className="mr-1.5 size-3.5" />
              {copy.title}
            </Badge>
            <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
              {copy.title}
            </h1>
            <p className="mt-4 text-pretty text-base text-muted-foreground md:text-lg">
              {copy.subtitle}
            </p>
          </div>
        </section>

        <Tabs defaultValue="packs" className="mx-auto max-w-5xl">
          <div className="flex items-center justify-center">
            <TabsList>
              <TabsTrigger value="subscriptions">{copy.tabs.subscriptions}</TabsTrigger>
              <TabsTrigger value="packs">{copy.tabs.packs}</TabsTrigger>
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
            <div className="mb-6 rounded-xl border border-primary/15 bg-card/60 p-5 backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ShieldCheck className="size-4 text-primary" />
                  {isZh ? "一次性购买 · 无自动续费 · 永不过期" : "One-time purchase · No auto-renew · Never expires"}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="size-3.5" />
                    PayPal
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {packPlans.map((p) => (
                <PlanCard key={p.name} plan={p} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mx-auto mt-10 max-w-5xl rounded-xl border border-border/60 bg-card/50 p-5 text-sm text-muted-foreground backdrop-blur-xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-primary" />
              <span>{copy.note}</span>
            </div>
            <Button asChild variant="ghost" size="sm" className="justify-start sm:justify-center">
              <a href="mailto:support@sakura-ai.example?subject=Sakura%20AI%20Billing%20Help">
                {isZh ? "需要帮助？联系我们" : "Need help? Contact us"}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
