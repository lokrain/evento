import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";

import { languageAlternates, getBaseUrl, getLocalizedUrl, OG_IMAGE_SIZE } from "@/lib/seo";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { getTranslations } from 'next-intl/server';
import { latin, plovdiv } from '@/styles/fonts';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const baseUrl = getBaseUrl();
  const localizedUrl = getLocalizedUrl(locale, baseUrl);
  const keywords = (t.raw("keywords") as string[] | undefined)?.filter(Boolean);
  const rawTitleTemplate = t.raw("titleTemplate") as string | undefined;
  const titleTemplate: string = rawTitleTemplate ? rawTitleTemplate.replace("{title}", "%s") : "%s";

  return {
    metadataBase: baseUrl,
    title: {
      default: t("title"),
      template: titleTemplate,
    },
    description: t("description"),
    applicationName: t("applicationName"),
    category: t("category"),
    keywords,
    alternates: {
      canonical: localizedUrl.toString(),
      languages: languageAlternates(baseUrl),
    },
    openGraph: {
      type: "website",
      url: localizedUrl.toString(),
      title: t("ogTitle"),
      description: t("ogDescription"),
      siteName: t("applicationName"),
      locale: locale === "bg" ? "bg_BG" : "en_US",
      images: [
        {
          url: `/${locale}/opengraph-image`,
          width: OG_IMAGE_SIZE.width,
          height: OG_IMAGE_SIZE.height,
          alt: t("ogAlt"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("ogTitle"),
      description: t("ogDescription"),
      images: [`/${locale}/opengraph-image`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
    creator: t("applicationName"),
    publisher: t("applicationName"),
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "dark light",
  viewportFit: "cover",
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();
  const isProduction = process.env.NODE_ENV === "production";
  const localeFontClass =
    locale === "bg"
      ? `${plovdiv.display.variable} ${plovdiv.sans.variable}`
      : `${latin.display.variable} ${latin.sans.variable}`;

  return (
    <>
      <div className={`${localeFontClass} font-sans`} data-locale={locale}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <main id="main-content" className="min-h-screen">
            {children}
          </main>
        </NextIntlClientProvider>
      </div>
      {isProduction && <Analytics />}
      {isProduction && <SpeedInsights />}
    </>
  );
}