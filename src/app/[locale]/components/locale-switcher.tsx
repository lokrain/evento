"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useTransition } from "react";
import { Spinner } from "@/components/ui/spinner";
import { localeMeta, routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const FlagBg = () => (
  <svg viewBox="0 0 3 2" aria-hidden="true" className="h-full w-full block">
    <defs>
      <clipPath id="flag-bg-circle">
        <circle cx="1.5" cy="1" r="1" />
      </clipPath>
    </defs>
    <g clipPath="url(#flag-bg-circle)">
      <rect width="3" height="2" fill="#fff" />
      <rect width="3" height="1.333" y="0.667" fill="#00966E" />
      <rect width="3" height="0.667" y="1.333" fill="#D62612" />
    </g>
  </svg>
);

const FlagEn = () => (
  <svg viewBox="0 0 60 30" aria-hidden="true" className="h-full w-full block">
    <defs>
      <clipPath id="flag-en-circle">
        <circle cx="30" cy="15" r="15" />
      </clipPath>
    </defs>
    <g clipPath="url(#flag-en-circle)">
      <rect width="60" height="30" fill="#012169" />
      <path d="M0 0 L60 30 M60 0 L0 30" stroke="#fff" strokeWidth="6" />
      <path d="M0 0 L60 30 M60 0 L0 30" stroke="#C8102E" strokeWidth="4" />
      <rect x="24" width="12" height="30" fill="#fff" />
      <rect y="9" width="60" height="12" fill="#fff" />
      <rect x="26" width="8" height="30" fill="#C8102E" />
      <rect y="11" width="60" height="8" fill="#C8102E" />
    </g>
  </svg>
);

export function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (nextLocale: string) => {
    const segments = pathname.split("/").filter(Boolean);
    segments[0] = nextLocale; // replace locale segment
    router.push(`/${segments.join("/")}`);
  };

  const locales = routing.locales;
  const currentIndex = locales.indexOf(locale as (typeof locales)[number]);
  const nextLocale = locales[(currentIndex + 1) % locales.length];
  const current = localeMeta[locale as keyof typeof localeMeta] ?? {
    label: locale.toUpperCase(),
    flag: "en",
  };
  const next = localeMeta[nextLocale as keyof typeof localeMeta] ?? {
    label: nextLocale.toUpperCase(),
    flag: "en",
  };

  return (
    <button
      type="button"
      onClick={() => startTransition(() => switchLocale(nextLocale))}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border bg-background p-0 transition hover-lift",
        "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isPending && "cursor-wait",
      )}
      disabled={isPending}
      aria-busy={isPending}
      aria-label={`Switch language to ${next.label}`}
    >
      {isPending ? (
        <Spinner className="h-4 w-4" aria-hidden="true" />
      ) : current.flag === "bg" ? (
        <FlagBg />
      ) : (
        <FlagEn />
      )}
    </button>
  );
}

export function LocaleSwitcherSkeleton() {
  return (
    <div className="h-9 w-9 motion-safe:animate-pulse rounded-full bg-muted" aria-hidden="true" />
  );
}
