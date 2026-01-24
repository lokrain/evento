import { setRequestLocale } from "next-intl/server";

import { Card, CardContent } from "@/components/ui/card";
import { Body, H1, Lead, Overline, Small, Subtitle } from "@/components/ui/typography";
import { featuredBands, formatRemoteLabel } from "@/data/bands";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Header } from "../components/header";

type PageProps = { params: Promise<{ locale: string }> };

export default async function RequestIndexPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <Header />
      <section className="section-block">
        <div className="section-heading">
          <Overline>Band requests</Overline>
          <H1>Choose a band to request</H1>
          <Lead>Every request is tied to a specific band listing.</Lead>
          <Small className="text-muted-foreground">
            Select a band below to open the structured request form.
          </Small>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {featuredBands.map((band) => {
            const href = band.href ?? `/request/${band.id}`;
            return (
            <Link
              key={band.id}
              href={href}
              className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              aria-label={`Open request form for ${band.name}`}
            >
              <Card className="h-full border-border/60 bg-card/60 hover-lift overflow-hidden py-0">
                <CardContent className="relative p-0">
                  <div className="relative aspect-[4/5]">
                    <Image
                      src={band.image}
                      alt={band.imageAlt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 45vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/55 to-black/10" aria-hidden="true" />
                    <div className="absolute inset-0 flex flex-col justify-end gap-3 p-6 text-white">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Subtitle className="text-white text-balance break-words">{band.name}</Subtitle>
                          <Body className="text-white/70">
                            {band.city}, {band.country} • {formatRemoteLabel(band.remote)}
                          </Body>
                        </div>
                        <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-white/80">
                          Open
                        </span>
                      </div>
                      <Body className="text-white/80 break-words line-clamp-3">{band.summary}</Body>
                      <div className="flex flex-wrap gap-2">
                        {band.genres.slice(0, 3).map((genre) => (
                          <span
                            key={genre}
                            className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs text-white/70"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
          })}
        </div>
      </section>
    </div>
  );
}
