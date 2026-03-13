import { createServerClient } from "@supabase/ssr"
import type { NextRequest, NextResponse } from "next/server"

import { getSupabaseEnv, isSupabaseBypassed } from "@/lib/supabase/env"

export function createSupabaseRouteClient(
  request: NextRequest,
  response: NextResponse,
) {
  if (isSupabaseBypassed()) {
    return {
      auth: {
        async getUser() {
          return { data: { user: null }, error: null }
        },
        async signInWithOAuth() {
          return {
            data: { url: null },
            error: { message: "Supabase is disabled in local development." },
          }
        },
        async signOut() {
          return { error: null }
        },
        async exchangeCodeForSession() {
          return {
            data: null,
            error: { message: "Supabase is disabled in local development." },
          }
        },
      },
    } as ReturnType<typeof createServerClient>
  }

  const { url, anonKey } = getSupabaseEnv()

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })
}
