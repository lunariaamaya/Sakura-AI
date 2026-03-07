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
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sakura AI - AI Image Editor",
    template: "%s | Sakura AI",
  },
  description: "Transform any image with simple text prompts. Advanced AI model for consistent character editing and scene preservation.",
  keywords: [
    "AI image editor",
    "text to image",
    "image to image",
    "AI photo editing",
    "Sakura AI",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Sakura AI - AI Image Editor",
    description: "Transform any image with simple text prompts.",
    url: "/",
    siteName: "Sakura AI",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Sakura AI - AI Image Editor",
    description: "Transform any image with simple text prompts.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
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
  const initialLocale: Locale = localeCookie === "zh" ? "zh" : "en"

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
