import { Button } from "@/components/ui/button"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6 py-16">
      <h1 className="text-2xl font-semibold">Account</h1>

      {user ? (
        <div className="rounded-lg border border-border/60 p-4">
          <div className="text-sm text-muted-foreground">Signed in as</div>
          <div className="mt-1 break-all font-medium">
            {user.email ?? user.id}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          You are not signed in.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {user ? (
          <Button asChild>
            <a href="/auth/sign-out?next=/">Sign out</a>
          </Button>
        ) : (
          <Button asChild>
            <a href="/auth/sign-in/google?next=/account">Sign in with Google</a>
          </Button>
        )}
        <Button variant="outline" asChild>
          <a href="/">Home</a>
        </Button>
      </div>
    </main>
  )
}
