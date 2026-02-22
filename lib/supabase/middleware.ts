import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import { getSupabaseEnv } from "@/lib/supabase/env"

// Keep the Supabase session fresh (refresh token rotation) and persist auth cookies.
export async function updateSession(request: NextRequest) {
  const { url, anonKey } = getSupabaseEnv()

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })

        // Recreate the response to make sure it includes the updated request headers.
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        })

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  // IMPORTANT: avoid any logic between creating the client and calling getUser(),
  // otherwise it can create hard-to-debug auth issues.
  await supabase.auth.getUser()

  return response
}
