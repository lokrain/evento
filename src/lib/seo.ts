import { routing } from "@/i18n/routing";

const LOCAL_FALLBACK_URL = "http://localhost:3000";

function normalizeUrl(candidate?: string | null) {
  if (!candidate) return null;
  try {
    const value = candidate.startsWith("http") ? candidate : `https://${candidate}`;
    return new URL(value);
  } catch {
    return null;
  }
}

export function getBaseUrl(): URL {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_URL;

  return normalizeUrl(envUrl) ?? new URL(LOCAL_FALLBACK_URL);
}

export function getLocalizedUrl(locale: string, base = getBaseUrl()) {
  return new URL(`/${locale}`, base);
}

export function languageAlternates(base = getBaseUrl()) {
  return routing.locales.reduce<Record<string, string>>((acc, locale) => {
    acc[locale] = getLocalizedUrl(locale, base).toString();
    return acc;
  }, {});
}

export const OG_IMAGE_SIZE = { width: 1200, height: 630 };
