"use client";

import type { ReactNode, RefObject } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { formatRemoteLabel, type BandProfile } from "@/data/bands";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";

type AutoCarouselProps = {
  items: BandProfile[];
  reverse?: boolean;
  speedPxPerSec?: number;
  renderLink?: (band: BandProfile, content: ReactNode) => ReactNode;
  className?: string;
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media: MediaQueryList = globalThis.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();

    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

function useContinuousScroll(params: {
  readonly viewportRef: RefObject<HTMLDivElement>;
  readonly trackRef: RefObject<HTMLDivElement>;
  readonly direction: 1 | -1;
  readonly speedPxPerSec: number;
  readonly enabled: boolean;
  readonly paused: boolean;
  readonly repeatCount: number;
}) {
  const {
    viewportRef,
    trackRef,
    direction,
    speedPxPerSec,
    enabled,
    paused,
    repeatCount,
  } = params;

  useEffect(() => {
    if (!enabled || paused) return;

    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    let frame = 0;
    let last = performance.now();

    const getLoopSize = () => {
      const height = track.scrollHeight;
      return height > 0 && repeatCount > 0 ? height / repeatCount : 0;
    };

    const loop = (time: number) => {
      const delta = Math.max(0, (time - last) / 1000);
      last = time;

      const loopSize = getLoopSize();
      if (loopSize > 0) {
        const distance = speedPxPerSec * delta * direction;
        let next = viewport.scrollTop + distance;

        if (direction > 0 && next >= loopSize) {
          next -= loopSize;
        } else if (direction < 0 && next <= 0) {
          next += loopSize;
        }

        viewport.scrollTop = next;
      }

      frame = requestAnimationFrame(loop);
    };

    const initialLoop = getLoopSize();
    if (direction < 0 && initialLoop > 0 && viewport.scrollTop <= 1) {
      viewport.scrollTop = initialLoop;
    }

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [direction, enabled, paused, repeatCount, speedPxPerSec, trackRef, viewportRef]);
}

function BandAdCard({ band, minHeight }: { band: BandProfile; minHeight: string }) {
  const toneMap: Record<BandProfile["tone"], string> = {
    indigo: "from-indigo-400/20 via-slate-900/70",
    emerald: "from-emerald-400/20 via-slate-900/70",
    amber: "from-amber-400/20 via-slate-900/70",
    rose: "from-rose-400/20 via-slate-900/70",
  };

  return (
    <Card
      className="group relative overflow-hidden border border-white/10 bg-black/40 py-0 shadow-2xl text-white"
      style={{ minHeight }}
    >
      <div className="absolute inset-0">
        <Image
          src={band.image}
          alt={band.imageAlt}
          fill
          sizes="(max-width: 1024px) 90vw, 45vw"
          className="object-cover brightness-[0.85] transition-transform duration-700 group-hover:scale-[1.05]"
        />
      </div>
      <div
        className={cn("absolute inset-0 bg-linear-to-br to-transparent", toneMap[band.tone])}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/55 to-black/10" aria-hidden="true" />
      <CardContent className="relative flex h-full flex-col gap-3 p-6 drop-shadow">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="text-[0.65rem] uppercase tracking-[0.35em] text-white/60">
              Band request
            </span>
            <div className="mt-2 text-xl font-semibold text-white text-balance break-words">
              {band.name}
            </div>
            <div className="text-xs text-white/60">
              {band.city}, {band.country} • {formatRemoteLabel(band.remote)}
            </div>
          </div>
          <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-white/70">
            Open
          </span>
        </div>
        <p className="text-sm text-white/85 break-words line-clamp-3">{band.summary}</p>
        <div className="flex flex-wrap gap-2">
          {band.genres.slice(0, 3).map((genre) => (
            <span
              key={genre}
              className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[0.7rem] text-white/70"
            >
              {genre}
            </span>
          ))}
        </div>
        <div className="text-xs text-white/70">
          <span className="font-semibold text-white/90">Seeking:</span>{" "}
          {band.lookingFor
            .slice(0, 3)
            .map((role) => role.role)
            .join(", ")}
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 text-xs text-white/70">
          <span>Comp: {band.compensation}</span>
          <span>{band.callToAction}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function AutoCarousel({
  items,
  reverse = false,
  speedPxPerSec = 18,
  renderLink,
  className,
}: AutoCarouselProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const paused = isHovering || isFocused;
  const repeatCount = items.length > 1 ? 2 : 1;

  useContinuousScroll({
    viewportRef,
    trackRef,
    direction: reverse ? -1 : 1,
    speedPxPerSec,
    enabled: !prefersReducedMotion && items.length > 1,
    paused,
    repeatCount,
  });

  const renderBands = useMemo(() => {
    if (items.length === 0) return [];
    return Array.from({ length: items.length * repeatCount }, (_, index) => items[index % items.length]);
  }, [items, repeatCount]);

  const itemHeightPct = (i: number) => {
    const heights = [26, 32, 28, 30, 24];
    return heights[i % heights.length];
  };

  return (
    <div
      className={`relative h-full overflow-hidden ${className ?? ""}`.trim()}
      data-orientation="vertical"
      aria-label="Featured bands"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") {
          setIsHovering(true);
        }
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") {
          setIsHovering(false);
        }
      }}
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={(event) => {
        const nextTarget = event.relatedTarget as Node | null;
        if (!event.currentTarget.contains(nextTarget)) {
          setIsFocused(false);
        }
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.06),transparent_30%)]" />

      <div ref={viewportRef} className="overflow-hidden h-full relative" style={{ scrollSnapType: "none" }}>
        <div ref={trackRef} role="list" className="flex flex-col gap-4 p-3 will-change-transform">
          {renderBands.map((band, index) => {
            const height = `${itemHeightPct(index)}dvh`;
            const card = <BandAdCard band={band} minHeight={height} />;
            if (renderLink) {
              return (
                <div key={`${band.id}-${index}`} role="listitem" className="shrink-0">
                  {renderLink(band, card)}
                </div>
              );
            }
            const href = band.href ?? `/request/${band.id}`;
            return (
              <Link
                key={`${band.id}-${index}`}
                href={href}
                aria-label={`Request ${band.name}`}
                role="listitem"
                className="block shrink-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              >
                {card}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type HeroCarouselsProps = {
  leftBands: BandProfile[];
  rightBands: BandProfile[];
  renderLink?: (band: BandProfile, content: ReactNode) => ReactNode;
  className?: string;
};

export function HeroCarousels({ leftBands, rightBands, renderLink, className }: HeroCarouselsProps) {
  return (
    <div className={`lg:grid grid-cols-2 gap-4 ${className ?? ""}`.trim()}>
      <AutoCarousel items={leftBands} reverse renderLink={renderLink} className="max-h-[80dvh]" />
      <AutoCarousel items={rightBands} renderLink={renderLink} className="max-h-[80dvh]" />
    </div>
  );
}
