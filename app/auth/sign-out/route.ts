import { NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const nextParam = url.searchParams.get("next") ?? "/"
  const next = nextParam.startsWith("/") ? nextParam : "/"

  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()

  return NextResponse.redirect(`${url.origin}${next}`)
}
