import { MetadataRoute } from "next"

const baseUrl = "https://debo.life"
const updatedAt = new Date("2026-09-24T00:00:00+05:30")

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: baseUrl, lastModified: updatedAt, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/about`, lastModified: updatedAt, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/pitch`, lastModified: updatedAt, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/foundation`, lastModified: updatedAt, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: updatedAt, changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: updatedAt, changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/join`, lastModified: updatedAt, changeFrequency: "weekly", priority: 0.8 },
  ]
}
