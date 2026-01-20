import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Spotlight } from '@/components/ui/spotlight';
import { Header } from './components/header';
import { Hero } from './components/hero';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Body, H2, H3, Lead, Overline, Small, Subtitle } from '@/components/ui/typography';
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle, ItemMedia } from '@/components/ui/item';
import { Icons } from '@/components/ui/icons';

type PageProps = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: PageProps) {
  const { locale }  = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Landing' });
  const steps = (t.raw('how.steps') as Array<{ title: string; description: string }>) ?? [];
  const safety = (t.raw('safety.items') as Array<{ title: string; description: string }>) ?? [];
  const proof = (t.raw('proof.items') as string[]) ?? [];
  const testimonials = (t.raw('proof.testimonials') as string[]) ?? [];
  const talent = (t.raw('talent.items') as Array<{ title: string; description: string }>) ?? [];

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <Spotlight />
      <Header />
      <Hero locale={locale} />
      <section
        id="process"
        aria-labelledby="process-title"
        aria-describedby="process-summary"
        className="section-block"
      >
        <div className="section-heading">
          <Overline>{t('how.eyebrow')}</Overline>
          <H2 id="process-title">{t('how.title')}</H2>
          <Lead id="process-summary">{t('how.lead')}</Lead>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {steps.map((step, index) => (
            <Card key={step.title} className="h-full hover-lift">
              <CardHeader>
                <Small>{String(index + 1).padStart(2, '0')}</Small>
                <H3>{step.title}</H3>
              </CardHeader>
              <CardContent>
                <Body className="text-muted-foreground">{step.description}</Body>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section
        id="safety"
        aria-labelledby="safety-title"
        aria-describedby="safety-summary"
        className="section-block"
      >
        <div className="section-heading">
          <Overline>{t('safety.eyebrow')}</Overline>
          <H2 id="safety-title">{t('safety.title')}</H2>
          <Lead id="safety-summary">{t('safety.lead')}</Lead>
        </div>
        <ItemGroup className="mt-10 gap-3">
          {safety.map((item, index) => {
            const safetyIcons = [Icons.escrow, Icons.contract, Icons.curation, Icons.dispute];
            const Icon = safetyIcons[index] ?? Icons.shieldCheck;
            return (
            <Item key={item.title} variant="outline" size="sm" className="hover-lift">
              <ItemMedia variant="icon">
                <Icon className="text-primary icon-pop icon-pop-hover" aria-hidden="true" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>
                  <H3 className="text-base">{item.title}</H3>
                </ItemTitle>
                <ItemDescription>{item.description}</ItemDescription>
              </ItemContent>
            </Item>
            );
          })}
        </ItemGroup>
      </section>

      <section
        id="proof"
        aria-labelledby="proof-title"
        aria-describedby="proof-summary"
        className="section-block"
      >
        <div className="section-heading">
          <Overline>{t('proof.eyebrow')}</Overline>
          <H2 id="proof-title">{t('proof.title')}</H2>
          <Lead id="proof-summary">{t('proof.lead')}</Lead>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {proof.map((statement) => (
            <Card key={statement} className="hover-lift">
              <CardContent className="pt-6">
                <Body>{statement}</Body>
              </CardContent>
            </Card>
          ))}
        </div>
        {testimonials.length > 0 && (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {testimonials.map((quote) => (
              <Card key={quote} className="border-dashed hover-lift">
                <CardContent className="pt-6">
                  <Body className="text-muted-foreground">“{quote}”</Body>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section
        id="talent"
        aria-labelledby="talent-title"
        aria-describedby="talent-summary"
        className="section-block"
      >
        <div className="section-heading">
          <Overline>{t('talent.eyebrow')}</Overline>
          <H2 id="talent-title">{t('talent.title')}</H2>
          <Lead id="talent-summary">{t('talent.lead')}</Lead>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {talent.map((card, index) => {
            const talentIcons = [Icons.dj, Icons.mc, Icons.band, Icons.acoustic, Icons.band, Icons.dj];
            const Icon = talentIcons[index] ?? Icons.music;
            return (
            <Card key={card.title} className="hover-lift">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary icon-pop icon-pop-hover" aria-hidden="true" />
                  <Subtitle>{card.title}</Subtitle>
                </div>
              </CardHeader>
              <CardContent>
                <Body className="text-muted-foreground">{card.description}</Body>
              </CardContent>
            </Card>
            );
          })}
        </div>
      </section>

      <section
        id="cta"
        aria-labelledby="cta-title"
        aria-describedby="cta-summary"
        className="section-block"
      >
        <div className="rounded-2xl border border-border bg-card px-6 py-12 sm:px-12">
          <div className="section-heading">
            <Overline>{t('cta.eyebrow')}</Overline>
            <H2 id="cta-title">{t('cta.title')}</H2>
            <Lead id="cta-summary">{t('cta.lead')}</Lead>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href="mailto:hello@evento.co">{t('cta.primary')}</a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#process">{t('cta.secondary')}</a>
              </Button>
            </div>
            <Small>{t('cta.micro')}</Small>
          </div>
        </div>
      </section>

      <footer id="footer" className="mx-auto w-full max-w-6xl px-6 py-12" aria-label="Footer">
        <div className="grid gap-6 border-t border-border pt-8 md:grid-cols-[1.5fr_1fr]">
          <div className="space-y-3">
            <Subtitle>{t('footer.title')}</Subtitle>
            <Body className="text-muted-foreground">{t('footer.description')}</Body>
          </div>
          <nav className="grid gap-2 text-sm text-muted-foreground" aria-label="Footer links">
            {((t.raw('footer.links') as Array<{ label: string; href: string }>) ?? []).map((link) => (
              <a key={link.href} href={link.href} className="hover:text-foreground">
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}