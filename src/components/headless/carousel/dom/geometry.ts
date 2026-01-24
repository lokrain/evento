import { asPx } from "../core/brands";
import type { Axis, CommitThreshold, Px } from "../core/types";

/**
 * Clamp a numeric slide index according to loop semantics.
 *
 * This is intentionally local to the DOM geometry module because these helpers
 * are used at boundary points (nav/settle) where DOM measurement occurs.
 */
export function clampIndexNumber(index: number, count: number, loop: boolean): number {
  if (count <= 0) return 0;
  const i = Math.trunc(index);

  if (loop) {
    // Positive modulo for wrapping.
    return ((i % count) + count) % count;
  }

  if (i < 0) return 0;
  if (i >= count) return count - 1;
  return i;
}

function pickAlignPointPx(align: "start" | "center" | "end", startPx: number, sizePx: number): number {
  if (align === "start") return startPx;
  if (align === "center") return startPx + sizePx / 2;
  return startPx + sizePx;
}

function pickAlignOffsetPx(align: "start" | "center" | "end", sizePx: number): number {
  if (align === "start") return 0;
  if (align === "center") return sizePx / 2;
  return sizePx;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

type SnapPoint = {
  readonly index: number;
  readonly point: number;
  readonly size: number;
};

function resolveCommitThresholdPx(params: {
  readonly threshold: CommitThreshold;
  readonly viewportSize: number;
  readonly baselineSize: number;
  readonly snapDistance: number;
}): number {
  const raw = Number(params.threshold.value);
  if (!Number.isFinite(raw)) return 0;

  switch (params.threshold.kind) {
    case "px":
      return Math.max(0, raw);
    case "viewport": {
      const ratio = clamp01(raw);
      return Math.max(0, params.viewportSize) * ratio;
    }
    case "slide": {
      const ratio = clamp01(raw);
      return Math.max(0, params.baselineSize) * ratio;
    }
    case "snap": {
      const ratio = clamp01(raw);
      return Math.max(0, params.snapDistance) * ratio;
    }
  }
}

/**
 * Compute the scroll target (Px) needed to align a slide to the viewport snap line.
 *
 * Boundary-only:
 * - Reads layout via getBoundingClientRect.
 * - Must not be called from the scroll handler hot path.
 */
export function computeScrollTargetPxFromDom(params: {
  readonly axis: Axis;
  readonly align: "start" | "center" | "end";
  readonly viewport: HTMLElement;
  readonly slideEl: HTMLElement | null;
}): Px {
  const { viewport, slideEl, axis, align } = params;

  const currentScroll = axis === "x" ? viewport.scrollLeft : viewport.scrollTop;

  if (!slideEl) {
    return asPx(Number.isFinite(currentScroll) ? currentScroll : 0);
  }

  const vpRect = viewport.getBoundingClientRect();
  const slRect = slideEl.getBoundingClientRect();

  const vpStart = axis === "x" ? vpRect.left : vpRect.top;
  const vpSize = axis === "x" ? vpRect.width : vpRect.height;

  const slStart = axis === "x" ? slRect.left : slRect.top;
  const slSize = axis === "x" ? slRect.width : slRect.height;

  const vpLineOffset = pickAlignOffsetPx(align, vpSize);
  const slPointOffset = pickAlignOffsetPx(align, slSize);

  // delta between where slide's align point is now vs where viewport's snap line is
  const delta = (slStart + slPointOffset) - (vpStart + vpLineOffset);
  const next = currentScroll + delta;

  return asPx(Number.isFinite(next) ? next : currentScroll);
}

/**
 * Compute the committed (logical) index by finding the slide closest to the viewport snap line.
 *
 * Boundary-only:
 * - Reads layout via getBoundingClientRect.
 * - Called at settle boundary, never on scroll hot path.
 */
export function computeCommittedIndexFromDom(params: {
  readonly axis: Axis;
  readonly align: "start" | "center" | "end";
  readonly viewport: HTMLElement | null;
  readonly slides: Map<number, HTMLElement | null>;
  readonly slideCount: number;
  readonly loop: boolean;
  readonly fallbackIndex: number;
  readonly commitThreshold?: CommitThreshold;
}): number {
  const viewport = params.viewport;
  if (!viewport) return clampIndexNumber(params.fallbackIndex, params.slideCount, params.loop);

  const vpRect = viewport.getBoundingClientRect();
  const vpStart = params.axis === "x" ? vpRect.left : vpRect.top;
  const vpSize = params.axis === "x" ? vpRect.width : vpRect.height;

  const vpLine = pickAlignPointPx(params.align, vpStart, vpSize);

  const fallbackIndex = clampIndexNumber(params.fallbackIndex, params.slideCount, params.loop);

  let best: SnapPoint | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  let baseline: SnapPoint | null = null;

  const count = Math.max(0, Math.trunc(params.slideCount));
  for (let i = 0; i < count; i += 1) {
    const el = params.slides.get(i) ?? null;
    if (!el) continue;

    const r = el.getBoundingClientRect();
    const slStart = params.axis === "x" ? r.left : r.top;
    const slSize = params.axis === "x" ? r.width : r.height;

    const slPoint = pickAlignPointPx(params.align, slStart, slSize);
    const dist = Math.abs(slPoint - vpLine);

    if (i === fallbackIndex) {
      baseline = { index: i, point: slPoint, size: slSize };
    }

    if (dist < bestDist) {
      bestDist = dist;
      best = { index: i, point: slPoint, size: slSize };
    }
  }

  if (!best) return fallbackIndex;

  const nextIndex = clampIndexNumber(best.index, params.slideCount, params.loop);
  if (!params.commitThreshold || !baseline || nextIndex === fallbackIndex) {
    return nextIndex;
  }

  const distanceFromBaseline = Math.abs(vpLine - baseline.point);
  const snapDistance = Math.abs(best.point - baseline.point);
  const thresholdPx = resolveCommitThresholdPx({
    threshold: params.commitThreshold,
    viewportSize: vpSize,
    baselineSize: baseline.size,
    snapDistance,
  });

  if (distanceFromBaseline < thresholdPx) {
    return fallbackIndex;
  }

  return nextIndex;
}

/**
 * Extract slide index from a DOM event target.
 *
 * Contract:
 * - Slides must set: data-carousel-slide-index="<n>".
 * - Returns null if the target is outside a slide.
 */
export function extractSlideIndexFromDomTarget(target: EventTarget | null): number | null {
  if (!(target instanceof HTMLElement)) return null;

  const el = target.closest?.("[data-carousel-slide-index]");
  if (!el) return null;

  const raw = el.getAttribute("data-carousel-slide-index");
  if (raw === null) return null;

  const n = Number(raw);
  if (!Number.isFinite(n)) return null;

  const i = Math.trunc(n);
  if (i < 0) return null;

  return i;
}
