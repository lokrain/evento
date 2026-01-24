import { Card, CardContent } from "@/components/ui/card";
import { Body, H2, Overline, Small, Subtitle } from "@/components/ui/typography";
import { formatRemoteLabel, type BandProfile } from "@/data/bands";
import Image from "next/image";

export function BandSummary({ band }: { band: BandProfile }) {
  return (
    <Card className="border-border/60 bg-card/70 overflow-hidden py-0">
      <div className="relative aspect-[16/9]">
        <Image
          src={band.image}
          alt={band.imageAlt}
          fill
          sizes="(max-width: 1024px) 100vw, 70vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/55 to-black/10" aria-hidden="true" />
        <div className="absolute inset-0 flex flex-col justify-end gap-2 p-6 text-white">
          <Overline className="text-white/60">Target band</Overline>
          <H2 className="text-white text-balance break-words">{band.name}</H2>
          <Small className="text-white/70">
            {band.city}, {band.country} • {formatRemoteLabel(band.remote)}
          </Small>
        </div>
      </div>
      <CardContent className="space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {band.status}
          </div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {band.callToAction}
          </div>
        </div>
        <Body className="text-muted-foreground break-words">{band.summary}</Body>
        <div className="flex flex-wrap gap-2">
          {band.genres.map((genre) => (
            <span
              key={genre}
              className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground"
            >
              {genre}
            </span>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Subtitle>Looking for</Subtitle>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {band.lookingFor.map((role) => (
                <li key={`${band.id}-${role.role}`}>
                  {role.role} • {role.skill} • {role.commitment}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Subtitle>Compensation</Subtitle>
            <Body className="text-muted-foreground">{band.compensation}</Body>
            <Small className="text-muted-foreground">Response window: {band.responseWindow}</Small>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
