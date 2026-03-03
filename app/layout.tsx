import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { cookies } from "next/headers"
import './globals.css'

import { AppProviders } from "@/components/app-providers"
import { Navbar } from "@/components/navbar"
import { getUserCredits } from "@/lib/credits"
import type { Locale } from "@/lib/i18n"
import { createSupabaseServerClient } from "@/lib/supabase/server"

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Sakura AI - AI Image Editor',
  description: 'Transform any image with simple text prompts. Advanced AI model for consistent character editing and scene preservation.',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get("sakura-locale")?.value
  const initialLocale: Locale = localeCookie === "en" ? "en" : "zh"

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const authUser = user
    ? {
        name:
          (user.user_metadata?.full_name as string | undefined) ??
          (user.user_metadata?.name as string | undefined) ??
          user.email ??
          "User",
        email: user.email ?? undefined,
        avatarUrl:
          (user.user_metadata?.avatar_url as string | undefined) ??
          (user.user_metadata?.picture as string | undefined) ??
          undefined,
      }
    : null

  let initialCredits: number | null = null
  if (user) {
    try {
      initialCredits = (await getUserCredits(user.id)).totalCredits
    } catch {
      initialCredits = null
    }
  }

  return (
    <html lang={initialLocale} className="scroll-smooth">
      <body className="font-sans antialiased">
        <AppProviders initialLocale={initialLocale}>
          <Navbar authUser={authUser} initialCredits={initialCredits} />
          {children}
        </AppProviders>
        <Analytics />
      </body>
    </html>
  )
}
