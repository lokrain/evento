"use client";

import * as React from "react";
import { buildA11yClearAnnouncement } from "./actions/builders/build-a11y";
import { buildMotionClear, buildMotionStart } from "./actions/builders/build-motion";
import {
  buildNavCommitIndex,
  buildNavRequestGoto,
  buildNavRequestNext,
  buildNavRequestPrev,
} from "./actions/builders/build-navigation";
import { buildVirtualSetEpoch, buildVirtualSetWindow } from "./actions/builders/build-virtual"; 
import { getNextButtonBindings, getPrevButtonBindings } from "./bindings/controls";
import { getSlideBindings } from "./bindings/slide";
import { asPx } from "./core/brands";
import type { Axis, Px } from "./core/types";
import { attachFocusPinGate } from "./dom/gates/focus-pin";
import { scrollToPx } from "./dom/io/scroll-to";
import { keydownToCommand } from "./dom/listeners/on-keydown";
import { createScrollHandler } from "./dom/listeners/on-scroll";
import { createRefs } from "./dom/refs/create-refs";
import {
  clearSettled,
  createInitialSettleState,
  notifyScrollEnd,
  resetSettleTracking,
  type SettleMachineState,
  sampleSettle,
  startSettleTracking,
} from "./model/settle/settle-machine";
import { createRafSettleSampler } from "./model/settle/settle-raf";
import { subscribeScrollEnd } from "./model/settle/settle-scrollend";
import { reduceCarousel } from "./store/reducer";
import {
  selectAnnounceEnabled,
  selectLastAnnouncement,
  selectLiveMode,
} from "./store/selectors/select-a11y";
import { selectCanNav } from "./store/selectors/select-can-nav";
import {
  selectPinnedIndices,
  selectVirtualEpoch,
  selectVirtualWindow,
} from "./store/selectors/select-window";
import type { CarouselState, CreateInitialStateOptions } from "./store/state";
import { createInitialState } from "./store/state";
import { getRootBindings } from "./bindings/root";
import { getViewportBindings } from "./bindings/viewport";
import { getTrackBindings } from "./bindings/track";
import { computeVirtualWindow } from "./model/virtual/compute-window";
import { computeVirtualSlots } from "./model/virtual/loop-keys";

export interface UseCarouselOptions extends CreateInitialStateOptions {
  readonly label: string;
  readonly smoothScroll?: boolean;
  readonly align?: "start" | "center" | "end";
}

export interface CarouselApi {
  next(): void;
  prev(): void;
  goTo(index: number): void;
}

export interface CarouselBindings {
  readonly root: ReturnType<typeof getRootBindings>;
  readonly viewport: ReturnType<typeof getViewportBindings>;
  readonly track: ReturnType<typeof getTrackBindings>;

  readonly slide: (logicalIndex: number) => ReturnType<typeof getSlideBindings>;

  readonly prevButton: ReturnType<typeof getPrevButtonBindings>;
  readonly nextButton: ReturnType<typeof getNextButtonBindings>;

  readonly liveRegion: {
    readonly "aria-live": "off" | "polite" | "assertive";
    readonly "aria-atomic": true;
    readonly children: string | null;
  };

  readonly slots: ReadonlyArray<{
    readonly key: string;
    readonly logicalIndex: number;
  }>;
}

export interface UseCarouselResult {
  readonly state: CarouselState;
  readonly api: CarouselApi;
  readonly bindings: CarouselBindings;
}

export function useCarousel(opts: UseCarouselOptions): UseCarouselResult {
  // -----------------------------
  // Store (single writer)
  // -----------------------------
  const [state, dispatch] = React.useReducer(reduceCarousel, opts, createInitialState);

  // Keep latest state in a ref for stable handlers (React 19 friendly).
  const stateRef = React.useRef<CarouselState>(state);
  React.useLayoutEffect(() => {
    stateRef.current = state;
  }, [state]);

  // -----------------------------
  // DOM refs (dumb plumbing)
  // -----------------------------
  const internalRefs = React.useMemo(() => createRefs(), []);
  const latestScrollPxRef = React.useRef<Px>(asPx(0));

  // Settle state (owned here; no driver)
  const settleRef = React.useRef<SettleMachineState>(createInitialSettleState());

  // Local settle token (not coupled to store.motion.token to avoid async mismatch)
  const settleTokenRef = React.useRef<number>(0);

  // Epoch seam tracking for loop mode
  const lastSeamBucketRef = React.useRef<number>(0);

  // -----------------------------
  // Hot path: scroll sink and handler
  // -----------------------------
  const scrollSink = React.useMemo(
    () => ({
      write(px: Px) {
        latestScrollPxRef.current = px;
      },
    }),
    [],
  );

  // Attach scroll listener when viewport is available.
  React.useEffect(() => {
    const viewport = internalRefs.state.viewport;
    if (!viewport) return;

    const onScroll = createScrollHandler({
      axis: stateRef.current.axis,
      viewport,
      sink: scrollSink,
    });

    viewport.addEventListener("scroll", onScroll, { passive: true });
    return () => viewport.removeEventListener("scroll", onScroll);
  }, [internalRefs, scrollSink]);

  // -----------------------------
  // RAF settle sampler (stable)
  // -----------------------------
  const rafSampler = React.useMemo(() => {
    return createRafSettleSampler({
      shouldContinue: () =>
        settleRef.current.pendingToken !== null && settleRef.current.settledToken === null,
      onFrame: () => {
        // Boundary: sample settle (not hot-path scroll event)
        const px = latestScrollPxRef.current as unknown as number;
        settleRef.current = sampleSettle(settleRef.current, px);

        const settled = settleRef.current.settledToken;
        if (settled === null) return;

        // Commit index at settle boundary
        const s = stateRef.current;

        const committed = computeCommittedIndexFromDom({
          axis: s.axis,
          align: opts.align ?? "center",
          viewport: internalRefs.state.viewport,
          slides: internalRefs.state.slides,
          slideCount: s.slideCount,
          loop: s.loop,
          fallbackIndex: s.index as unknown as number,
        });

        dispatch(buildNavCommitIndex({ index: committed, source: "settle" }));
        dispatch(buildMotionClear("reset"));

        settleRef.current = clearSettled(settleRef.current);
      },
    });
  }, [internalRefs.state.slides, opts.align]);

  // scrollend fast-path: notify + ensure RAF is running (single place commits).
  React.useEffect(() => {
    const viewport = internalRefs.state.viewport;
    if (!viewport) return;

    const unsub = subscribeScrollEnd(viewport, () => {
      settleRef.current = notifyScrollEnd(settleRef.current);
      rafSampler.start();
    });

    return () => unsub();
  }, [internalRefs, rafSampler]);

  // -----------------------------
  // Focus pin gate wiring (virtualization correctness)
  // -----------------------------
  React.useEffect(() => {
    const root = internalRefs.state.root;
    if (!root) return;

    const detach = attachFocusPinGate({
      root,
      dispatch,
      slideIndexFromTarget: (target) => extractSlideIndexFromDomTarget(target),
    });

    return () => detach();
  }, [internalRefs]);

  // -----------------------------
  // Keyboard navigation wiring (boundary)
  // -----------------------------
  React.useEffect(() => {
    const root = internalRefs.state.root;
    if (!root) return;

    const handler = (e: KeyboardEvent) => {
      const s = stateRef.current;

      const cmd = keydownToCommand({ e, axis: s.axis, dir: s.dir });
      if (!cmd) return;

      const can = selectCanNav(s);
      if (cmd === "prev" && !can.canPrev) return;
      if (cmd === "next" && !can.canNext) return;

      e.preventDefault();

      if (cmd === "prev") {
        dispatch(buildNavRequestPrev("keyboard"));
        executeNav({ kind: "prev", source: "keyboard" });
      } else {
        dispatch(buildNavRequestNext("keyboard"));
        executeNav({ kind: "next", source: "keyboard" });
      }
    };

    root.addEventListener("keydown", handler);
    return () => root.removeEventListener("keydown", handler);
  }, [internalRefs]);

  // -----------------------------
  // Virtualization: compute window on boundaries (not on scroll)
  // -----------------------------
  React.useEffect(() => {
    const s = stateRef.current;

    const pinned = selectPinnedIndices(s);
    const res = computeVirtualWindow({
      slideCount: s.slideCount,
      loop: s.loop,
      index: s.index,
      windowSize: s.virtual.windowSize,
      overscan: s.virtual.overscan,
      pinned,
    });

    dispatch(buildVirtualSetWindow(res.window));

    if (s.loop) {
      const prevBucket = lastSeamBucketRef.current;
      if (res.seamBucket !== prevBucket) {
        lastSeamBucketRef.current = res.seamBucket;
        dispatch(buildVirtualSetEpoch(s.virtual.epoch + 1, "loop-seam"));
      }
    } else {
      lastSeamBucketRef.current = 0;
    }
  }, [
    // Explicit boundary deps only
    state.slideCount,
    state.loop,
    state.index,
    state.virtual.windowSize,
    state.virtual.overscan,
    state.virtual.epoch,
    state.virtual.pinned,
  ]);

  // -----------------------------
  // Navigation executor (stable, uses refs)
  // -----------------------------
  const executeNav = React.useCallback(
    (params: {
      readonly kind: "next" | "prev" | "goto";
      readonly index?: number;
      readonly source: "api" | "keyboard" | "button" | "autoplay";
    }) => {
      const s = stateRef.current;
      const viewport = internalRefs.state.viewport;
      if (!viewport) return;

      const count = s.slideCount;
      if (count <= 0) return;

      const current = s.index as unknown as number;
      const targetIdx =
        params.kind === "goto"
          ? clampIndexNumber(params.index ?? 0, count, s.loop)
          : params.kind === "next"
            ? clampIndexNumber(current + 1, count, s.loop)
            : clampIndexNumber(current - 1, count, s.loop);

      // Compute target px from DOM at boundary.
      const targetPx = computeScrollTargetPxFromDom({
        axis: s.axis,
        align: opts.align ?? "center",
        viewport,
        slideEl: internalRefs.state.slides.get(targetIdx) ?? null,
      });

      const reduced = s.gates.reducedMotion;
      const behavior: ScrollBehavior = reduced || opts.smoothScroll === false ? "auto" : "smooth";

      // Mark motion (store token is informational; settle uses local token for correctness)
      dispatch(buildMotionStart({ isAnimating: behavior === "smooth", reason: "nav" }));

      // Arm settle machine
      settleTokenRef.current += 1;
      const token = settleTokenRef.current;

      settleRef.current = startSettleTracking(
        settleRef.current,
        token,
        latestScrollPxRef.current as unknown as number,
      );

      // Scroll (single writer for DOM scroll)
      scrollToPx({ viewport, axis: s.axis, px: targetPx, options: { behavior } });

      // Ensure settle sampling runs until resolved
      rafSampler.start();
    },
    [internalRefs, opts.align, opts.smoothScroll, rafSampler],
  );

  // -----------------------------
  // API (stable)
  // -----------------------------
  const api = React.useMemo<CarouselApi>(
    () => ({
      next: () => {
        const s = stateRef.current;
        const can = selectCanNav(s);
        if (!can.canNext) return;
        dispatch(buildNavRequestNext("api"));
        executeNav({ kind: "next", source: "api" });
      },
      prev: () => {
        const s = stateRef.current;
        const can = selectCanNav(s);
        if (!can.canPrev) return;
        dispatch(buildNavRequestPrev("api"));
        executeNav({ kind: "prev", source: "api" });
      },
      goTo: (index: number) => {
        dispatch(buildNavRequestGoto(index, "api"));
        executeNav({ kind: "goto", index, source: "api" });
      },
    }),
    [executeNav],
  );

  // -----------------------------
  // Derived virtual slots for rendering
  // -----------------------------
  const window = selectVirtualWindow(state);
  const epoch = selectVirtualEpoch(state);

  const slots = React.useMemo(() => {
    if (!window) return [];
    const items = computeVirtualSlots({
      window,
      slideCount: state.slideCount,
      loop: state.loop,
      epoch,
    });
    return items.map((x) => ({ key: x.key, logicalIndex: x.logicalIndex }));
  }, [epoch, state.loop, state.slideCount, window]);

  // -----------------------------
  // A11y live region props
  // -----------------------------
  const liveMode = selectLiveMode(state);
  const announceEnabled = selectAnnounceEnabled(state);
  const announcement = announceEnabled ? selectLastAnnouncement(state) : null;

  // Optional: clear announcement after paint to avoid repeats on rerender.
  React.useEffect(() => {
    if (announcement === null) return;
    const id = globalThis.setTimeout(() => {
      dispatch(buildA11yClearAnnouncement("policy"));
    }, 0);
    return () => {
      globalThis.clearTimeout(id);
    };
  }, [announcement]);

  // Reset settle on unmount
  React.useEffect(() => {
    return () => {
      settleRef.current = resetSettleTracking(settleRef.current);
      rafSampler.stop();
    };
  }, [rafSampler]);

  // -----------------------------
  // Bindings (clean consumer API)
  // -----------------------------
  const can = selectCanNav(state);

  const rootRef = React.useMemo(() => {
    // Consumer may pass their own ref later; we keep internal stable for now.
    return internalRefs.root;
  }, [internalRefs]);

  const viewportRef = React.useMemo(() => internalRefs.viewport, [internalRefs]);
  const trackRef = React.useMemo(() => internalRefs.track, [internalRefs]);

  const bindings: CarouselBindings = React.useMemo(() => {
    return {
      root: getRootBindings({ label: opts.label, ref: rootRef }),
      viewport: getViewportBindings({ ref: viewportRef }),
      track: getTrackBindings({ ref: trackRef }),

      slide: (logicalIndex: number) =>
        getSlideBindings({
          index: logicalIndex,
          total: state.slideCount,
          ref: internalRefs.slide(logicalIndex),
        }),

      prevButton: getPrevButtonBindings({ canPrev: can.canPrev }),
      nextButton: getNextButtonBindings({ canNext: can.canNext }),

      liveRegion: {
        "aria-live": liveMode,
        "aria-atomic": true,
        children: announcement,
      },

      slots,
    };
  }, [
    announcement,
    can.canNext,
    can.canPrev,
    internalRefs,
    liveMode,
    opts.label,
    rootRef,
    slots,
    state.slideCount,
    trackRef,
    viewportRef,
  ]);

  return { state, api, bindings };
}

// --------------------------------------------------------
// DOM helpers (boundary-only, used for snap/commit)
// --------------------------------------------------------

function clampIndexNumber(index: number, count: number, loop: boolean): number {
  if (count <= 0) return 0;
  const i = Math.trunc(index);

  if (loop) {
    const m = ((i % count) + count) % count;
    return m;
  }

  if (i < 0) return 0;
  if (i >= count) return count - 1;
  return i;
}

function computeScrollTargetPxFromDom(params: {
  readonly axis: Axis;
  readonly align: "start" | "center" | "end";
  readonly viewport: HTMLElement;
  readonly slideEl: HTMLElement | null;
}): Px {
  const { viewport, slideEl, axis, align } = params;
  if (!slideEl) {
    const raw = axis === "x" ? viewport.scrollLeft : viewport.scrollTop;
    return asPx(Number.isFinite(raw) ? raw : 0);
  }

  const vpRect = viewport.getBoundingClientRect();
  const slRect = slideEl.getBoundingClientRect();

  const vpStart = axis === "x" ? vpRect.left : vpRect.top;
  const vpSize = axis === "x" ? vpRect.width : vpRect.height;

  const slStart = axis === "x" ? slRect.left : slRect.top;
  const slSize = axis === "x" ? slRect.width : slRect.height;

  const currentScroll = axis === "x" ? viewport.scrollLeft : viewport.scrollTop;

  const vpLine = align === "start" ? 0 : align === "center" ? vpSize / 2 : vpSize;
  const slPoint = align === "start" ? 0 : align === "center" ? slSize / 2 : slSize;

  const delta = slStart + slPoint - (vpStart + vpLine);
  const next = currentScroll + delta;

  return asPx(Number.isFinite(next) ? next : currentScroll);
}

function computeCommittedIndexFromDom(params: {
  readonly axis: Axis;
  readonly align: "start" | "center" | "end";
  readonly viewport: HTMLElement | null;
  readonly slides: Map<number, HTMLElement | null>;
  readonly slideCount: number;
  readonly loop: boolean;
  readonly fallbackIndex: number;
}): number {
  const viewport = params.viewport;
  if (!viewport) return params.fallbackIndex;

  const vpRect = viewport.getBoundingClientRect();
  const vpStart = params.axis === "x" ? vpRect.left : vpRect.top;
  const vpSize = params.axis === "x" ? vpRect.width : vpRect.height;

  const vpLine =
    params.align === "start"
      ? vpStart
      : params.align === "center"
        ? vpStart + vpSize / 2
        : vpStart + vpSize;

  let bestIdx = params.fallbackIndex;
  let bestDist = Number.POSITIVE_INFINITY;

  const count = Math.max(0, Math.trunc(params.slideCount));
  for (let i = 0; i < count; i += 1) {
    const el = params.slides.get(i) ?? null;
    if (!el) continue;

    const r = el.getBoundingClientRect();
    const slStart = params.axis === "x" ? r.left : r.top;
    const slSize = params.axis === "x" ? r.width : r.height;

    const slPoint =
      params.align === "start"
        ? slStart
        : params.align === "center"
          ? slStart + slSize / 2
          : slStart + slSize;

    const dist = Math.abs(slPoint - vpLine);
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = i;
    }
  }

  return clampIndexNumber(bestIdx, params.slideCount, params.loop);
}

/**
 * Extract slide index from DOM target.
 * This expects slides to set: data-carousel-slide-index="<n>".
 * We keep parsing logic centralized and strict.
 */
function extractSlideIndexFromDomTarget(target: EventTarget | null): number | null {
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
