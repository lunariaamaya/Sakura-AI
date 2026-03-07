"use client"

import { useEffect, useState } from "react"
import { Coins, Globe, LogOut, Menu, UserRound, X } from "lucide-react"

import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type AuthUser = {
  name: string
  email?: string
  avatarUrl?: string
}

export function Navbar({
  authUser,
  initialCredits,
}: {
  authUser?: AuthUser | null
  initialCredits?: number | null
}) {
  const { t, locale, toggleLocale } = useI18n()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [credits, setCredits] = useState<number | null>(initialCredits ?? null)

  useEffect(() => {
    if (!authUser) return

    const syncCredits = async () => {
      const res = await fetch("/api/credits")
      if (!res.ok) return
      const data = (await res.json()) as {
        credits?: { totalCredits?: number }
      }
      if (typeof data?.credits?.totalCredits === "number") {
        setCredits(data.credits.totalCredits)
      }
    }

    void syncCredits()
  }, [authUser])

  useEffect(() => {
    const onCreditsUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ totalCredits?: number }>
      if (typeof customEvent.detail?.totalCredits === "number") {
        setCredits(customEvent.detail.totalCredits)
      }
    }

    window.addEventListener("credits-updated", onCreditsUpdated as EventListener)
    return () => {
      window.removeEventListener(
        "credits-updated",
        onCreditsUpdated as EventListener,
      )
    }
  }, [])

  const navLinks = [
    { key: "nav.features", href: "/#features" },
    { key: "nav.showcase", href: "/#showcase" },
    { key: "nav.reviews", href: "/#reviews" },
    { key: "nav.faq", href: "/#faq" },
    { key: "nav.pricing", href: "/pricing-v2" },
  ]

  const loginLabel = t("nav.signIn")
  const signOutLabel = t("nav.signOut")

  return (
    <header className="fixed top-0 right-0 left-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <a href="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C12 2 8 6 8 10C8 12.5 9.5 14 12 14C14.5 14 16 12.5 16 10C16 6 12 2 12 2Z"
                fill="#0a0a0f"
              />
              <path
                d="M12 14C9 14 4 16 4 20C4 22 6 22 8 21C10 20 11 18 12 18C13 18 14 20 16 21C18 22 20 22 20 20C20 16 15 14 12 14Z"
                fill="#0a0a0f"
              />
            </svg>
          </div>
          <span className="text-lg font-bold text-foreground">Sakura AI</span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.key}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t(link.key)}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {authUser ? (
            <div className="hidden items-center gap-1 rounded-md border border-border/60 bg-secondary/70 px-2.5 py-1 text-xs md:inline-flex">
              <Coins className="size-3.5 text-primary" />
              <span className="font-medium text-foreground">
                {credits ?? "--"} {t("nav.credits")}
              </span>
            </div>
          ) : null}

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLocale}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <Globe className="size-4" />
            <span className="text-xs font-medium">
              {locale === "zh" ? "EN" : "中文"}
            </span>
          </Button>

          {authUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="hidden items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-accent md:flex"
                >
                  <Avatar className="size-7">
                    <AvatarImage
                      src={authUser.avatarUrl}
                      alt={authUser.name}
                      referrerPolicy="no-referrer"
                    />
                    <AvatarFallback>
                      <UserRound className="size-4 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-36 truncate text-sm font-medium">
                    {authUser.name}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <a href="/account">{t("nav.account")}</a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild variant="destructive">
                  <a href="/auth/sign-out?next=/">
                    <LogOut className="size-4" />
                    {signOutLabel}
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden md:inline-flex"
            >
              <a href="/auth/sign-in/google?next=/account">{loginLabel}</a>
            </Button>
          )}

          <Button asChild size="sm" className="hidden md:inline-flex">
            <a href="/account">{t("nav.start")}</a>
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1 p-4">
            {navLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {t(link.key)}
              </a>
            ))}

            <Button asChild size="sm" className="mt-2 w-full">
              <a href="/account" onClick={() => setMobileOpen(false)}>
                {t("nav.start")}
              </a>
            </Button>

            {authUser ? (
              <>
                <div className="mt-2 flex items-center gap-3 rounded-md border border-border/60 p-3">
                  <Avatar className="size-9">
                    <AvatarImage
                      src={authUser.avatarUrl}
                      alt={authUser.name}
                      referrerPolicy="no-referrer"
                    />
                    <AvatarFallback>
                      <UserRound className="size-4 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {authUser.name}
                    </div>
                    {authUser.email ? (
                      <div className="truncate text-xs text-muted-foreground">
                        {authUser.email}
                      </div>
                    ) : null}
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href="/auth/sign-out?next=/" onClick={() => setMobileOpen(false)}>
                    {signOutLabel}
                  </a>
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a
                  href="/auth/sign-in/google?next=/account"
                  onClick={() => setMobileOpen(false)}
                >
                  {loginLabel}
                </a>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
