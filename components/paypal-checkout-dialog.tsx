"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Loader2 } from "lucide-react"

import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

declare global {
  interface Window {
    paypal?: {
      Buttons: (options: unknown) => { render: (selector: string | HTMLElement) => void }
    }
  }
}

type Props = {
  title: string
  description?: string
  amount: number
  currencyCode?: string
  buttonLabel: string
  sku: string
  disabled?: boolean
  className?: string
}

function loadPayPalSdk(clientId: string, currencyCode: string) {
  const id = "paypal-js-sdk"
  const existing = document.getElementById(id) as HTMLScriptElement | null
  if (existing) return

  const script = document.createElement("script")
  script.id = id
  script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
    clientId
  )}&currency=${encodeURIComponent(currencyCode)}&intent=capture`
  script.async = true
  document.body.appendChild(script)
}

function extractTotalCredits(data: unknown): number | null {
  const row = Array.isArray(data) ? data[0] : data
  if (!row || typeof row !== "object") return null
  const free = Number((row as any)?.free_credits ?? (row as any)?.freeCredits ?? 0)
  const paid = Number((row as any)?.paid_credits ?? (row as any)?.paidCredits ?? 0)
  const total = Number((row as any)?.total_credits ?? (row as any)?.totalCredits ?? free + paid)
  return Number.isFinite(total) ? total : null
}

function broadcastCredits(totalCredits: number) {
  window.dispatchEvent(
    new CustomEvent("credits-updated", {
      detail: { totalCredits },
    }),
  )
}

export function PayPalCheckoutDialog({
  title,
  description,
  amount,
  currencyCode = "USD",
  buttonLabel,
  sku,
  disabled,
  className,
}: Props) {
  const { t } = useI18n()
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  const containerRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<
    | { type: "idle" }
    | { type: "loading" }
    | { type: "ready" }
    | { type: "success" }
    | { type: "error"; message: string }
  >({ type: "idle" })

  const amountFixed = useMemo(() => Number(amount.toFixed(2)), [amount])

  useEffect(() => {
    if (!open) return

    if (!clientId) {
      setStatus({
        type: "error",
        message: t("paypal.error.missingClientId"),
      })
      return
    }

    setStatus({ type: "loading" })
    loadPayPalSdk(clientId, currencyCode)

    let cancelled = false
    const startedAt = Date.now()
    const interval = window.setInterval(() => {
      if (cancelled) return
      if (Date.now() - startedAt > 15000) {
        setStatus({
          type: "error",
          message: t("paypal.error.timeout"),
        })
        window.clearInterval(interval)
        return
      }
      if (!window.paypal?.Buttons) return
      if (!containerRef.current) return

      // Clear previous renders (dialog reopen)
      containerRef.current.innerHTML = ""

      window.paypal.Buttons({
        createOrder: async () => {
          if (!sku) {
            throw new Error(t("paypal.error.missingSku"))
          }
          const res = await fetch("/api/paypal/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sku,
            }),
          })
          const json = (await res.json()) as { id?: string; error?: string }
          if (!res.ok || !json.id) {
            throw new Error(json.error || t("paypal.error.createOrderFailed"))
          }
          return json.id
        },
        onApprove: async (data: { orderID?: string }) => {
          const orderId = data.orderID
          if (!orderId) throw new Error(t("paypal.error.missingOrderId"))

          const res = await fetch("/api/paypal/capture-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId }),
          })
          const json = (await res.json()) as { error?: string }
          if (!res.ok) throw new Error(json.error || t("paypal.error.captureFailed"))

          setStatus({ type: "success" })

          try {
            const supabase = getSupabaseBrowserClient()
            const { data } = await supabase.rpc("get_my_credits")
            const total = extractTotalCredits(data)
            if (typeof total === "number") {
              broadcastCredits(total)
            }

            window.setTimeout(async () => {
              try {
                const { data: delayedData } = await supabase.rpc("get_my_credits")
                const delayedTotal = extractTotalCredits(delayedData)
                if (typeof delayedTotal === "number") {
                  broadcastCredits(delayedTotal)
                }
              } catch {
                // Ignore delayed refresh failures.
              }
            }, 5000)
          } catch {
            // Ignore refresh failures (credits can be fetched later).
          }
        },
        onCancel: () => {
          setStatus({ type: "error", message: t("paypal.status.cancel") })
        },
        onError: (err: unknown) => {
          const message = err instanceof Error ? err.message : t("paypal.error.generic")
          setStatus({ type: "error", message })
        },
      }).render(containerRef.current)

      setStatus({ type: "ready" })
      window.clearInterval(interval)
    }, 100)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [open, clientId, currencyCode, amountFixed, title, sku, t])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={className} disabled={disabled}>
          {buttonLabel}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        <div className="rounded-lg border border-border/60 bg-card/50 p-4">
          <div className="text-sm text-muted-foreground">{t("paypal.total")}</div>
          <div className="mt-1 text-2xl font-semibold">
            ${amountFixed.toFixed(2)} {currencyCode}
          </div>
        </div>

        {status.type === "loading" ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            {t("paypal.loading")}
          </div>
        ) : null}

        {status.type === "error" ? (
          <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-300">
            {status.message}
          </div>
        ) : null}

        {status.type === "success" ? (
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
            {t("paypal.status.success")}
          </div>
        ) : null}

        <div ref={containerRef} />
      </DialogContent>
    </Dialog>
  )
}
