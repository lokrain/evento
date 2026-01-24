import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { Spotlight } from "@/components/ui/spotlight";
import { Body, H1, Lead, Overline, Small } from "@/components/ui/typography";
import { getBandById } from "@/data/bands";
import { Header } from "../../components/header";
import { BandSummary } from "./band-summary";
import { RequestForm } from "./request-form";

type PageProps = { params: Promise<{ locale: string; bandId: string }> };

export default async function RequestBandPage({ params }: PageProps) {
  const { locale, bandId } = await params;
  setRequestLocale(locale);

  const band = getBandById(bandId);
  if (!band) {
    notFound();
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <Spotlight />
      <Header />
      <section className="section-block">
        <div className="section-heading">
          <Overline>Band request</Overline>
          <H1>Find the Right Band Members</H1>
          <Lead>
            Post a structured request so musicians who actually fit can respond.
          </Lead>
          <Body className="max-w-2xl text-muted-foreground">
            This is not a social feed. Complete the sections below so we can match serious players
            quickly and responsibly.
          </Body>
          <Small className="text-muted-foreground">
            Expect 5 to 8 minutes to complete. You can save a draft at any time.
          </Small>
        </div>
      </section>
      <section className="section-block">
        <BandSummary band={band} />
      </section>
      <RequestForm band={band} />
    </div>
  );
}
