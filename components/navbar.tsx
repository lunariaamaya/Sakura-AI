"use client"

import { useState } from "react"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Globe, Menu, X } from "lucide-react"

export function Navbar() {
  const { t, locale, toggleLocale } = useI18n()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { key: "nav.features", href: "#features" },
    { key: "nav.showcase", href: "#showcase" },
    { key: "nav.reviews", href: "#reviews" },
    { key: "nav.faq", href: "#faq" },
  ]

  return (
    <header className="fixed top-0 right-0 left-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <a href="#" className="flex items-center gap-2">
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
          <span className="text-lg font-bold text-foreground">
            Sakura AI
          </span>
        </a>

        {/* Desktop nav */}
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
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLocale}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <Globe className="size-4" />
            <span className="text-xs font-medium">{locale === "zh" ? "EN" : "中文"}</span>
          </Button>
          <Button size="sm" className="hidden md:inline-flex">
            {t("nav.start")}
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

      {/* Mobile nav */}
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
            <Button size="sm" className="mt-2 w-full">
              {t("nav.start")}
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
