import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["bg", "en"],
  defaultLocale: "bg",
  localePrefix: 'always', // keeps locale in URL for App Router consistency
  localeDetection: true
});

export const localeMeta = {
  bg: { label: "BG", flag: "bg" },
  en: { label: "EN", flag: "en" },
} as const;