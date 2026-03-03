import { NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const nextParam = url.searchParams.get("next") ?? "/"
  const next = nextParam.startsWith("/") ? nextParam : "/"
  const forwardedHost = request.headers.get("x-forwarded-host")
  const forwardedProto = request.headers.get("x-forwarded-proto")
  const siteOrigin = forwardedHost
    ? `${forwardedProto ?? "https"}://${forwardedHost}`
    : url.origin

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteOrigin}/auth/callback?next=${encodeURIComponent(next)}`,
      queryParams: {
        prompt: "select_account",
      },
    },
  })

  if (error || !data.url) {
    const message = encodeURIComponent(error?.message ?? "OAuth sign-in failed")
    return NextResponse.redirect(`${url.origin}/auth/error?message=${message}`)
  }

  return NextResponse.redirect(data.url)
}
