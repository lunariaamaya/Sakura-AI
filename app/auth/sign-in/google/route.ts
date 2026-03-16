import { NextResponse, type NextRequest } from "next/server"

import { createSupabaseRouteClient } from "@/lib/supabase/route"

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const nextParam = url.searchParams.get("next") ?? "/"
  const next = nextParam.startsWith("/") ? nextParam : "/"
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL
  const forwardedHost = request.headers.get("x-forwarded-host")
  const forwardedProto = request.headers.get("x-forwarded-proto")
  const forwardedOrigin = forwardedHost
    ? `${forwardedProto ?? "https"}://${forwardedHost}`
    : null
  let configuredOrigin: string | null = null
  if (configuredSiteUrl) {
    try {
      configuredOrigin = new URL(configuredSiteUrl).origin
    } catch {
      configuredOrigin = null
    }
  }
  const siteOrigin = configuredOrigin ?? forwardedOrigin ?? url.origin

  const response = NextResponse.next()
  response.cookies.set("sakura-next", next, {
    path: "/",
    maxAge: 60 * 10,
    sameSite: "lax",
  })
  const supabase = createSupabaseRouteClient(request, response)

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteOrigin}/auth/callback`,
      queryParams: {
        prompt: "select_account",
      },
    },
  })

  if (error || !data.url) {
    const message = encodeURIComponent(error?.message ?? "OAuth sign-in failed")
    const redirect = NextResponse.redirect(
      `${url.origin}/auth/error?message=${message}`,
    )
    response.cookies.getAll().forEach(({ name, value, ...options }) => {
      redirect.cookies.set(name, value, options)
    })
    return redirect
  }

  const redirect = NextResponse.redirect(data.url)
  response.cookies.getAll().forEach(({ name, value, ...options }) => {
    redirect.cookies.set(name, value, options)
  })
  return redirect
}
