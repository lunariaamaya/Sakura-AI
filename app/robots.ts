import type { MetadataRoute } from "next"

function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL

  const normalize = (url: string) => {
    const trimmed = url.replace(/\/+$/, "")
    if (/^https?:\/\//i.test(trimmed)) return trimmed
    return `https://${trimmed}`
  }

  if (configured) return normalize(configured)
  if (process.env.VERCEL_URL) return normalize(process.env.VERCEL_URL)

  return "http://localhost:3000"
}

const siteUrl = getSiteUrl()

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/auth/", "/account/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
