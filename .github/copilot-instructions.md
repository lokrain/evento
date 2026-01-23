## Overview
- Next.js 16 / React 19 App Router site with locale segment `[locale]` (default `bg`, `en` also) using `next-intl` 4; routing config lives in `src/i18n/{routing,request,navigation}.ts`. Keep locale in URLs (`localePrefix: "always"`) and call `setRequestLocale` in RSC entrypoints.
- Root layout (`src/app/layout.tsx`) injects an inline theme bootstrap script (keys `therapy-theme-color` / `therapy-theme-mode`) before paint; body is wrapped in `ThemeProvider` (client). Preserve `suppressHydrationWarning`, skip link, and initial `html` attrs (`lang="bg"`, `data-theme="sage"`).
- Locale layout (`src/app/[locale]/layout.tsx`) sets metadata via `next-intl` translations and `@/lib/seo`; fonts come from `src/styles/fonts.ts` (Bulgarian “plovdiv” locals vs Latin). Production-only analytics/speed-insights are toggled by `NODE_ENV`.

## Styling & Theming
- Tailwind v4 inline theme in `src/app/globals.css`; color systems keyed by `data-theme` with `.dark`/`.light` class on `<html>`. Avoid reformatting this file (Biome ignores it).
- Theme state is client-managed in `ThemeProvider` / `ThemeSwitcher`; update both `data-theme` attr and html class. When adding themes, extend `themeConfigs` and CSS variables.

## Content, SEO, and Assets
- Translations live in `/messages/{bg,en}.json`; server comps use `getTranslations` and clients use `useLocale`/navigation helpers from `src/i18n/navigation.ts`.
- SEO helpers in `src/lib/seo.ts` centralize base URL, localized URLs, and `languageAlternates`. `sitemap.ts`/`robots.ts` consume these; keep locale coverage in sync.
- Open Graph image (`src/app/[locale]/opengraph-image.tsx`) renders with `next/og` on `runtime="nodejs"`; loads local fonts via `fs/promises`. Keep size via `OG_IMAGE_SIZE`.

## Headless Carousel (required layout)
- Library lives in `src/components/headless/carousel`; keep structure exactly:
	- `index.ts`, `use-carousel.tsx` (wiring only; ~200 LOC target).
	- `core/` (types, brands, constants, clamp, invariant helpers).
	- `store/` state + reducer with `reduce/*` and `selectors/*` subfolders.
	- `actions/` (`action-types`, `action-builders/*`, `action-validate`).
	- `dom/` (`refs/*`, listeners `on-scroll|on-pointer|on-keydown`, IO `scroll-to|scroll-read`, gates `visibility|focus-within|hover`).
	- `measure/` (viewport/slide observers, flush/batching, anchor-lock).
	- `math/fenwick/*` (fenwick + lower-bound + tests).
	- `model/` (pure services: snap, virtual window, settle machine, autoplay policy with tests).
	- `a11y/` (aria prop builders; announce format/policy).
	- `bindings/` (prop getter helpers root/viewport/track/slide/controls).
- Preserve single-writer model: reducers drive state; dom listeners only dispatch; bindings expose prop getters. Keep tests alongside model/math where listed.

## Conventions & Performance
- Use path alias `@/*` (configured in tsconfig). Next config enables React Compiler and Turbopack; avoid patterns that defeat compiler (e.g., dynamic hook order).
- Follow Vercel React best practices (`.github/skills/vercel-react-best-practices/AGENTS.md`): prefer parallel data fetching, avoid barrel imports (especially `lucide-react`), and use dynamic imports for heavy/after-hydration code.
- Keep middleware locale redirect (`src/proxy.ts`) intact: non-locale URLs are redirected to default locale before `next-intl` middleware runs.

## Accessibility & UX
- Maintain `skip-link`, `aria` labelling on sections, live carousels `aria-controls`/`aria-live`, and reduced-motion gates (carousel respects `prefers-reduced-motion`).
- Locale switcher swaps first path segment; keep button accessible (`aria-busy`, flag SVGs hidden with `aria-hidden`).