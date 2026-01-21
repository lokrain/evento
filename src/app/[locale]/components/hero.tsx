import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { H1, Lead, Overline } from "@/components/ui/typography";
import { HeroCarousels } from "./hero-carousels";

export async function Hero({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Hero" });
  const bullets = (t.raw("bullets") as string[]) ?? [];
  const bulletIcons = [Icons.logo, Icons.radix, Icons.aria];

  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      aria-describedby="hero-summary"
      className="relative min-h-[calc(100dvh-4rem-3rem)] pb-4 pt-4"
    >
      <div className="mx-auto flex h-full w-full max-w-6xl items-center px-6">
        <div className="w-full rounded-3xl border border-border bg-card/60 p-6 shadow-sm lg:p-8">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
            <Card className="h-[80dvh] border-border/60 bg-background/70">
              <CardContent className="space-y-6 p-6">
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
                      <li key={bullet} className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                        <span>{bullet}</span>
                      </li>
                    );
                  })}
                </ul>
                <div className="flex flex-wrap gap-3">
                  <Button asChild size="lg" className="hover-lift">
                    <a href="#cta">{t("primaryCta")}</a>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="hover-lift">
                    <a href="#process">{t("secondaryCta")}</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <HeroCarousels leftCount={16} rightCount={20} className="h-[80dvh]" />
          </div>
        </div>
      </div>
    </section>
  );
}
