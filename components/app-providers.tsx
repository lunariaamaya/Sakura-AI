"use client"

import type { ReactNode } from "react"

import { I18nProvider, type Locale } from "@/lib/i18n"

export function AppProviders({
  children,
  initialLocale,
}: {
  children: ReactNode
  initialLocale: Locale
}) {
  return <I18nProvider initialLocale={initialLocale}>{children}</I18nProvider>
}
