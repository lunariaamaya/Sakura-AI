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

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return [
    { url: `${siteUrl}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/pricing`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/pricing-v2`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ]
}
