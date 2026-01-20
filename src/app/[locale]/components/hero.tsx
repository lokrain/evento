import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Lead, H1, Overline } from "@/components/ui/typography";
import { Icons } from "@/components/ui/icons";

export async function Hero({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Hero" });
  const bullets = (t.raw("bullets") as string[]) ?? [];
  const bulletIcons = [Icons.shieldCheck, Icons.fileText, Icons.badgeCheck];

  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      aria-describedby="hero-summary"
      className="relative"
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6 animate-fade-in">
            <Overline>{t("eyebrow")}</Overline>
            <H1 id="hero-title" className="max-w-2xl">
              {t("headline")}
            </H1>
            <Lead id="hero-summary" className="max-w-xl">
              {t("subline")}
            </Lead>
            <ul className="grid max-w-lg gap-2 text-sm text-muted-foreground">
              {bullets.map((bullet, index) => {
                const Icon = bulletIcons[index] ?? Icons.badgeCheck;
                return (
                  <li key={bullet} className="group flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary icon-pop icon-pop-hover" aria-hidden="true" />
                    <span>{bullet}</span>
                  </li>
                );
              })}
            </ul>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href="#cta">{t("primaryCta")}</a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#process">{t("secondaryCta")}</a>
              </Button>
            </div>
          </div>
          <aside className="rounded-2xl border border-border bg-card p-6 shadow-sm animate-fade-in animation-delay-200">
            <div className="flex items-center gap-2">
              <Icons.shieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
              <Overline>{t("panelEyebrow")}</Overline>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{t("panelCopy")}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
