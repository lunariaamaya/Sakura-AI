import { NextResponse } from "next/server"

import { IMAGE_GENERATION_COST } from "@/lib/credits"
import { createSupabaseServerClient } from "@/lib/supabase/server"

function extractTotalCredits(data: unknown): number | null {
  if (!data) return null
  const row = Array.isArray(data) ? data[0] : data
  const free = Number((row as any)?.free_credits ?? (row as any)?.freeCredits ?? 0)
  const paid = Number((row as any)?.paid_credits ?? (row as any)?.paidCredits ?? 0)
  const total = Number(
    (row as any)?.total_credits ?? (row as any)?.totalCredits ?? (free + paid),
  )
  return Number.isFinite(total) ? total : null
}

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      {
        error: "Authentication required",
        loginUrl: "/auth/sign-in/google?next=%2F%23editor",
      },
      { status: 401 },
    )
  }

  try {
    const { data, error } = await supabase.rpc("get_my_credits")
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const totalCredits = extractTotalCredits(data)
    if (totalCredits === null) {
      return NextResponse.json({ error: "Failed to parse credits" }, { status: 500 })
    }

    return NextResponse.json({
      credits: { totalCredits },
      costPerImage: IMAGE_GENERATION_COST,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load credits"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
