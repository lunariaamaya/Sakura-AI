import { getSupabaseAdminClient } from "@/lib/supabase/admin"

export const DAILY_FREE_CREDITS = 100
export const IMAGE_GENERATION_COST = 50

type CreditsRow = {
  user_id: string
  free_credits: number
  paid_credits: number
  last_daily_refresh: string
}

function todayUtcDateString() {
  return new Date().toISOString().slice(0, 10)
}

function toBalance(row: CreditsRow) {
  return {
    freeCredits: row.free_credits,
    paidCredits: row.paid_credits,
    totalCredits: row.free_credits + row.paid_credits,
    lastDailyRefresh: row.last_daily_refresh,
  }
}

async function getOrCreateCreditsRow(userId: string): Promise<CreditsRow> {
  const admin = getSupabaseAdminClient() as any
  const today = todayUtcDateString()

  const { data: existing, error: selectError } = await admin
    .from("user_credits")
    .select("user_id, free_credits, paid_credits, last_daily_refresh")
    .eq("user_id", userId)
    .maybeSingle()

  if (selectError) {
    throw selectError
  }

  if (!existing) {
    const { data: inserted, error: insertError } = await admin
      .from("user_credits")
      .insert({
        user_id: userId,
        free_credits: DAILY_FREE_CREDITS,
        paid_credits: 0,
        last_daily_refresh: today,
      })
      .select("user_id, free_credits, paid_credits, last_daily_refresh")
      .single()

    if (insertError) {
      throw insertError
    }

    return inserted as CreditsRow
  }

  const nextFreeCredits =
    existing.last_daily_refresh < today
      ? DAILY_FREE_CREDITS
      : Math.min(existing.free_credits ?? 0, DAILY_FREE_CREDITS)

  if (
    nextFreeCredits !== existing.free_credits ||
    existing.last_daily_refresh !== today
  ) {
    const { data: updated, error: updateError } = await admin
      .from("user_credits")
      .update({
        free_credits: nextFreeCredits,
        last_daily_refresh: today,
      })
      .eq("user_id", userId)
      .select("user_id, free_credits, paid_credits, last_daily_refresh")
      .single()

    if (updateError) {
      throw updateError
    }

    return updated as CreditsRow
  }

  return existing as CreditsRow
}

export async function getUserCredits(userId: string) {
  const row = await getOrCreateCreditsRow(userId)
  return toBalance(row)
}

export async function consumeUserCredits(userId: string, amount: number) {
  const admin = getSupabaseAdminClient() as any
  const row = await getOrCreateCreditsRow(userId)
  const total = row.free_credits + row.paid_credits

  if (total < amount) {
    return {
      ok: false as const,
      required: amount,
      available: total,
      balance: toBalance(row),
    }
  }

  const freeSpend = Math.min(row.free_credits, amount)
  const paidSpend = amount - freeSpend
  const nextFreeCredits = row.free_credits - freeSpend
  const nextPaidCredits = row.paid_credits - paidSpend

  const { data: updated, error } = await admin
    .from("user_credits")
    .update({
      free_credits: nextFreeCredits,
      paid_credits: nextPaidCredits,
    })
    .eq("user_id", userId)
    .select("user_id, free_credits, paid_credits, last_daily_refresh")
    .single()

  if (error) {
    throw error
  }

  return {
    ok: true as const,
    spent: amount,
    balance: toBalance(updated as CreditsRow),
  }
}
