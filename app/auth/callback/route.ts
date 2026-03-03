import { NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const oauthError = url.searchParams.get("error")
  const oauthErrorDescription = url.searchParams.get("error_description")
  const nextParam = url.searchParams.get("next") ?? "/"
  const next = nextParam.startsWith("/") ? nextParam : "/"

  if (oauthError || oauthErrorDescription) {
    const message = encodeURIComponent(
      oauthErrorDescription ?? oauthError ?? "OAuth callback failed",
    )
    return NextResponse.redirect(`${url.origin}/auth/error?message=${message}`)
  }

  if (code) {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      const message = encodeURIComponent(error.message)
      return NextResponse.redirect(`${url.origin}/auth/error?message=${message}`)
    }
  }

  if (!code) {
    const message = encodeURIComponent(
      "Missing OAuth code in callback. Check Supabase Auth redirect URLs and Google OAuth settings.",
    )
    return NextResponse.redirect(`${url.origin}/auth/error?message=${message}`)
  }

  return NextResponse.redirect(`${url.origin}${next}`)
}
