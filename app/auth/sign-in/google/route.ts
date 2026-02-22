import { NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const nextParam = url.searchParams.get("next") ?? "/"
  const next = nextParam.startsWith("/") ? nextParam : "/"

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${url.origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  })

  if (error || !data.url) {
    const message = encodeURIComponent(error?.message ?? "OAuth sign-in failed")
    return NextResponse.redirect(`${url.origin}/auth/error?message=${message}`)
  }

  return NextResponse.redirect(data.url)
}
