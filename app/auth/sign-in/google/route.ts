import { NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const nextParam = url.searchParams.get("next") ?? "/"
  const next = nextParam.startsWith("/") ? nextParam : "/"
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()

  let siteOrigin = url.origin
  if (configuredSiteUrl) {
    try {
      siteOrigin = new URL(configuredSiteUrl).origin
    } catch {
      const message = encodeURIComponent(
        "Invalid NEXT_PUBLIC_SITE_URL. Please set a full URL, e.g. https://your-domain.com",
      )
      return NextResponse.redirect(`${url.origin}/auth/error?message=${message}`)
    }
  }

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteOrigin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  })

  if (error || !data.url) {
    const message = encodeURIComponent(error?.message ?? "OAuth sign-in failed")
    return NextResponse.redirect(`${url.origin}/auth/error?message=${message}`)
  }

  return NextResponse.redirect(data.url)
}
