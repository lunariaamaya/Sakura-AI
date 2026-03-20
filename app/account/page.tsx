import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { AccountPage } from "@/components/account-page"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Account",
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AccountPageRoute() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/sign-in/google?next=/account")
  }

  const name =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "User"

  const avatarUrl =
    user.user_metadata?.avatar_url ??
    user.user_metadata?.picture ??
    undefined

  return (
    <AccountPage
      name={name}
      email={user.email}
      avatarUrl={avatarUrl}
    />
  )
}
