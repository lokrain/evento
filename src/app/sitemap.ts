import type { MetadataRoute } from "next";

import { routing } from "../i18n/routing";
import { getBaseUrl, getLocalizedUrl, languageAlternates } from "../lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  const languages = languageAlternates(baseUrl);
  const lastModified = new Date();

  return routing.locales.map((locale: string) => ({
    url: getLocalizedUrl(locale, baseUrl).toString(),
    lastModified,
    changeFrequency: "weekly",
    priority: locale === routing.defaultLocale ? 0.9 : 0.8,
    alternates: { languages },
  }));
}
