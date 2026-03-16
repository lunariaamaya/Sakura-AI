import { NextResponse, type NextRequest } from "next/server"

import { createSupabaseRouteClient } from "@/lib/supabase/route"

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const oauthError = url.searchParams.get("error")
  const oauthErrorDescription = url.searchParams.get("error_description")
  const nextParam = url.searchParams.get("next") ?? "/"
  const next = nextParam.startsWith("/") ? nextParam : "/"
  const response = NextResponse.next()
  const supabase = createSupabaseRouteClient(request, response)
  const nextCookie = request.cookies.get("sakura-next")?.value
  const fallbackNext = nextCookie && nextCookie.startsWith("/") ? nextCookie : "/"

  if (oauthError || oauthErrorDescription) {
    const message = encodeURIComponent(
      oauthErrorDescription ?? oauthError ?? "OAuth callback failed",
    )
    const redirect = NextResponse.redirect(
      `${url.origin}/auth/error?message=${message}`,
    )
    response.cookies.getAll().forEach(({ name, value, ...options }) => {
      redirect.cookies.set(name, value, options)
    })
    return redirect
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      const message = encodeURIComponent(error.message)
      const redirect = NextResponse.redirect(
        `${url.origin}/auth/error?message=${message}`,
      )
      response.cookies.getAll().forEach(({ name, value, ...options }) => {
        redirect.cookies.set(name, value, options)
      })
      return redirect
    }
  }

  if (!code) {
    const message = encodeURIComponent(
      "Missing OAuth code in callback. Check Supabase Auth redirect URLs and Google OAuth settings.",
    )
    const redirect = NextResponse.redirect(
      `${url.origin}/auth/error?message=${message}`,
    )
    response.cookies.getAll().forEach(({ name, value, ...options }) => {
      redirect.cookies.set(name, value, options)
    })
    return redirect
  }

  const finalNext = nextParam ? next : fallbackNext
  const redirect = NextResponse.redirect(`${url.origin}${finalNext}`)
  if (nextCookie) {
    redirect.cookies.set("sakura-next", "", { path: "/", maxAge: 0 })
  }
  response.cookies.getAll().forEach(({ name, value, ...options }) => {
    redirect.cookies.set(name, value, options)
  })
  return redirect
}
