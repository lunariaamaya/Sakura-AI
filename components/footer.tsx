"use client"

import { useI18n } from "@/lib/i18n"

export function Footer() {
  const { t } = useI18n()

  return (
    <footer className="border-t border-border/50 bg-card/50">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <a href="#" className="mb-4 flex items-center gap-2">
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
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t("footer.desc")}
            </p>

            {/* Decorative sakura */}
            <div className="mt-4 flex gap-1 opacity-30" aria-hidden="true">
              {[12, 10, 14, 8, 11].map((size, i) => (
                <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2C12 2 8 6 8 10C8 12.5 9.5 14 12 14C14.5 14 16 12.5 16 10C16 6 12 2 12 2Z"
                    fill="#f9a8d4"
                  />
                </svg>
              ))}
            </div>
          </div>

          {/* Product links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              {t("footer.product")}
            </h3>
            <ul className="space-y-2.5">
              {["footer.editor", "footer.generator", "footer.pricing"].map((key) => (
                <li key={key}>
                  <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    {t(key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              {t("footer.company")}
            </h3>
            <ul className="space-y-2.5">
              {["footer.about", "footer.blog", "footer.careers"].map((key) => (
                <li key={key}>
                  <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    {t(key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              {t("footer.legal")}
            </h3>
            <ul className="space-y-2.5">
              {["footer.privacy", "footer.terms"].map((key) => (
                <li key={key}>
                  <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    {t(key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border/50 pt-8">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Sakura AI. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  )
}
