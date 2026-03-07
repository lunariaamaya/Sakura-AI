import type { Metadata } from "next"

import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Auth Error",
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: { message?: string } | Promise<{ message?: string }>
}) {
  const { message } = await Promise.resolve(searchParams)

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold">Login failed</h1>
      <p className="text-sm text-muted-foreground">
        {message ?? "Unknown error"}
      </p>
      <div className="flex gap-2">
        <Button asChild>
          <a href="/account">Back</a>
        </Button>
        <Button variant="outline" asChild>
          <a href="/">Home</a>
        </Button>
      </div>
    </main>
  )
}
