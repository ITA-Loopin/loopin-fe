import type { MetadataRoute } from "next";

const SITE_URL = "https://loopin.co.kr";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/introduce`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    {
      url: `${SITE_URL}/account-deletion`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
