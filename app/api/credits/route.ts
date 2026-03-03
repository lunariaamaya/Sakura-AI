import { NextResponse } from "next/server"

import {
  DAILY_FREE_CREDITS,
  IMAGE_GENERATION_COST,
  getUserCredits,
} from "@/lib/credits"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      {
        error: "Authentication required",
        loginUrl: "/auth/sign-in/google?next=/#editor",
      },
      { status: 401 },
    )
  }

  try {
    const credits = await getUserCredits(user.id)
    return NextResponse.json({
      credits,
      dailyFreeCredits: DAILY_FREE_CREDITS,
      costPerImage: IMAGE_GENERATION_COST,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load credits"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
