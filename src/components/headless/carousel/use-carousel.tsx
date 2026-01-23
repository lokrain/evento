"use client";

import * as React from "react";
import { buildSettleAnnouncement } from "./a11y/announce/policy";
import { getLiveRegionProps } from "./a11y/aria/live-region-props";
import { createCarouselA11yIds } from "./a11y/ids";
import {
  buildA11yAnnounce,
  buildA11yClearAnnouncement,
  buildA11ySetLiveMode,
} from "./actions/builders/build-a11y";
import { buildAutoplaySetEnabled, buildGateSet } from "./actions/builders/build-autoplay";
import { buildMotionClear, buildMotionStart } from "./actions/builders/build-motion";
import {
  buildNavCommitIndex,
  buildNavRequestGoto,
  buildNavRequestNext,
  buildNavRequestPrev,
} from "./actions/builders/build-navigation";
import { buildVirtualSetEpoch, buildVirtualSetWindow } from "./actions/builders/build-virtual";
import { getNextButtonBindings, getPrevButtonBindings } from "./bindings/controls";
import { getRootBindings } from "./bindings/root";
import { getSlideBindings } from "./bindings/slide";
import { getTrackBindings } from "./bindings/track";
import { getViewportBindings } from "./bindings/viewport";
import { asPx } from "./core/brands";
import type {
  AutoplayController,
  AutoplayGate,
  CarouselBindings,
  CarouselEngine,
  CarouselReturn,
  Controllable,
  DataAttributes,
  SnapTarget,
  Uncontrolled,
  UseCarouselOptions,
} from "./core/types";
import type { Axis, Px } from "./core/types";
import { attachFocusPinGate } from "./dom/gates/focus-pin";
import { attachHoverGate } from "./dom/hover";
import { scrollToPx } from "./dom/io/scroll-to";
import { keydownToCommand } from "./dom/listeners/on-keydown";
import { createPointerGateHandler } from "./dom/listeners/on-pointer";
import { createScrollHandler } from "./dom/listeners/on-scroll";
import { attachReducedMotionGate } from "./dom/reduced-motion";
import { createRefs } from "./dom/refs/create-refs";
import { attachVisibilityGate } from "./dom/visibility";
import { computeAutoplayGates } from "./model/autoplay/gates";
import { computeAutoplayPolicy } from "./model/autoplay/policy";
import { createAutoplayTicker } from "./model/autoplay/tick";
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
import { computeVirtualWindow } from "./model/virtual/compute-window";
import { computeVirtualSlots } from "./model/virtual/loop-keys";
import { reduceCarousel } from "./store/reducer";
import { createCarouselFacade } from "./store/facade";
import { selectCanNav } from "./store/selectors/select-can-nav";
import { selectPinnedIndices } from "./store/selectors/select-window";
import type { CarouselState, CreateInitialStateOptions } from "./store/state";
import { createInitialState } from "./store/state";
export function useCarousel<
  IndexC extends Controllable<number> = Uncontrolled<number>,
  PlayingC extends Controllable<boolean> = Uncontrolled<boolean>,
>(opts: UseCarouselOptions<IndexC, PlayingC>): CarouselReturn<IndexC, PlayingC> {
  const normalized = React.useMemo(() => normalizeOptions(opts), [opts]);
  // -----------------------------
  // Store (single writer)
  // -----------------------------
  const [state, dispatch] = React.useReducer(
    reduceCarousel,
    normalized.initialState,
    createInitialState,
  );
  const facade = React.useMemo(() => createCarouselFacade(state), [state]);

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

  // Stable DOM ids for aria-controls
  const rawId = React.useId();
  const ids = React.useMemo(() => createCarouselA11yIds(String(rawId)), [rawId]);

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
          align: normalized.align,
          viewport: internalRefs.state.viewport,
          slides: internalRefs.state.slides,
          slideCount: s.slideCount,
          loop: s.loop,
          fallbackIndex: s.index as unknown as number,
        });

        dispatch(buildNavCommitIndex({ index: committed, source: "settle" }));

        const announcement = buildSettleAnnouncement({
          enabled: s.a11y.announceEnabled,
          reducedMotion: s.gates.reducedMotion,
          index: committed,
          total: s.slideCount,
          loop: s.loop,
        });

        if (announcement) {
          dispatch(buildA11yAnnounce({ text: announcement, source: "policy" }));
        }
        dispatch(buildMotionClear("reset"));

        settleRef.current = clearSettled(settleRef.current);
      },
    });
  }, [internalRefs.state.slides, internalRefs.state.viewport, normalized.align]);

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
  // Hover + visibility + reduced motion gates
  // -----------------------------
  React.useEffect(() => {
    const root = internalRefs.state.root;
    if (!root) return;

    const detachHover = attachHoverGate({ root, dispatch });
    const detachVisibility = attachVisibilityGate({ dispatch });
    const detachReduced = attachReducedMotionGate({ dispatch });

    return () => {
      detachHover();
      detachVisibility();
      detachReduced();
    };
  }, [internalRefs]);

  // -----------------------------
  // Pointer gate wiring (dragging)
  // -----------------------------
  React.useEffect(() => {
    const root = internalRefs.state.root;
    if (!root) return;

    const handler = createPointerGateHandler({ dispatch });

    root.addEventListener("pointerdown", handler, { passive: true });
    root.addEventListener("pointerup", handler, { passive: true });
    root.addEventListener("pointercancel", handler, { passive: true });

    return () => {
      root.removeEventListener("pointerdown", handler);
      root.removeEventListener("pointerup", handler);
      root.removeEventListener("pointercancel", handler);
    };
  }, [internalRefs]);

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
        align: normalized.align,
        viewport,
        slideEl: internalRefs.state.slides.get(targetIdx) ?? null,
      });

      const reduced = s.gates.reducedMotion;
      const behavior: ScrollBehavior = reduced || !normalized.smoothScroll ? "auto" : "smooth";

      // Mark motion
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
    [internalRefs, normalized.align, normalized.smoothScroll, rafSampler],
  );

  // -----------------------------
  // Keyboard navigation wiring (boundary)
  // -----------------------------
  React.useEffect(() => {
    const root = internalRefs.state.root;
    if (!root) return;

    const keydownOptions: AddEventListenerOptions = { passive: false };

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

    root.addEventListener("keydown", handler, keydownOptions);
    return () => root.removeEventListener("keydown", handler, keydownOptions);
  }, [internalRefs, executeNav]);

  // -----------------------------
  // Autoplay ticker (stable, Strict Mode safe)
  // -----------------------------
  const autoplayTicker = React.useMemo(() => {
    return createAutoplayTicker(() => {
      const s = stateRef.current;
      const can = selectCanNav(s);
      if (!can.canNext) return;

      dispatch(buildNavRequestNext("autoplay"));
      executeNav({ kind: "next", source: "autoplay" });
    });
  }, [executeNav]);

  // Autoplay boundary effect: gates + policy -> start/stop ticker + a11y live mode
  React.useEffect(() => {
    const s = state;

    const gates = computeAutoplayGates({
      enabled: s.autoplay.enabled,
      intervalMs: s.autoplay.intervalMs as unknown as number,
      slideCount: s.slideCount,
      gates: {
        manualPause: s.gates.manualPause,
        hover: s.gates.hover,
        focusWithin: s.gates.focusWithin,
        visibilityHidden: s.gates.visibilityHidden,
        dragging: s.gates.dragging,
        reducedMotion: s.gates.reducedMotion,
      },
    });

    const plan = computeAutoplayPolicy({
      gates,
      announceEnabled: s.a11y.announceEnabled,
      baselineLiveMode: "polite",
    });

    dispatch(buildA11ySetLiveMode({ mode: plan.desiredLiveMode, source: "policy" }));

    if (plan.shouldRun) {
      autoplayTicker.start(s.autoplay.intervalMs as unknown as number);
    } else {
      autoplayTicker.stop();
    }

    return () => {
      autoplayTicker.stop();
    };
  }, [autoplayTicker, state]);

  // -----------------------------
  // Virtualization: compute window on boundaries (not on scroll)
  // -----------------------------
  React.useEffect(() => {
    const s = state;

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
  }, [state]);

  // -----------------------------
  // Derived virtual slots for rendering
  // -----------------------------
  const window = facade.virtualWindow;
  const epoch = facade.virtualEpoch;

  const renderSlots = React.useMemo(() => {
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
  const liveMode = facade.liveMode;
  const announceEnabled = facade.announceEnabled;
  const announcement = announceEnabled ? facade.lastAnnouncement : null;

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
      autoplayTicker.stop();
    };
  }, [autoplayTicker, rafSampler]);

  // -----------------------------
  // Bindings (clean consumer API)
  // -----------------------------
  const can = facade.canNav;

  const rootRef = React.useMemo(() => internalRefs.root, [internalRefs]);
  const viewportRef = React.useMemo(() => internalRefs.viewport, [internalRefs]);
  const trackRef = React.useMemo(() => internalRefs.track, [internalRefs]);

  const renderCount = renderSlots.length > 0 ? renderSlots.length : state.slideCount;
  const getSlotForRenderIndex = React.useCallback(
    (renderIndex: number) =>
      renderSlots[renderIndex] ?? {
        key: `fallback-${renderIndex}`,
        logicalIndex: clampIndexNumber(renderIndex, state.slideCount, state.loop),
      },
    [renderSlots, state.loop, state.slideCount],
  );

  const canNavigate = !normalized.indexReadonly;
  const canControlPlaying = !normalized.playingReadonly;

  const handlePrev = React.useCallback(
    (event?: React.MouseEvent<HTMLButtonElement>) => {
      if (event?.defaultPrevented) return;
      if (!can.canPrev) return;
      if (!canNavigate) return;
      dispatch(buildNavRequestPrev("button"));
      executeNav({ kind: "prev", source: "button" });
    },
    [can.canPrev, canNavigate, executeNav],
  );

  const handleNext = React.useCallback(
    (event?: React.MouseEvent<HTMLButtonElement>) => {
      if (event?.defaultPrevented) return;
      if (!can.canNext) return;
      if (!canNavigate) return;
      dispatch(buildNavRequestNext("button"));
      executeNav({ kind: "next", source: "button" });
    },
    [can.canNext, canNavigate, executeNav],
  );

  const handleGoTo = React.useCallback(
    (index: number, event?: React.MouseEvent<HTMLButtonElement>) => {
      if (event?.defaultPrevented) return;
      if (!canNavigate) return;
      dispatch(buildNavRequestGoto(index, "button"));
      executeNav({ kind: "goto", index, source: "button" });
    },
    [canNavigate, executeNav],
  );

  const autoplaySnapshot = React.useMemo(() => {
    const gates = computeAutoplayGates({
      enabled: state.autoplay.enabled,
      intervalMs: state.autoplay.intervalMs as unknown as number,
      slideCount: state.slideCount,
      gates: {
        manualPause: state.gates.manualPause,
        hover: state.gates.hover,
        focusWithin: state.gates.focusWithin,
        visibilityHidden: state.gates.visibilityHidden,
        dragging: state.gates.dragging,
        reducedMotion: state.gates.reducedMotion,
      },
    });

    const plan = computeAutoplayPolicy({
      gates,
      announceEnabled: state.a11y.announceEnabled,
      baselineLiveMode: "polite",
    });

    return { gates, plan };
  }, [state]);

  const autoplayController: AutoplayController<PlayingC> = React.useMemo(() => {
    const getGates = (): Readonly<Record<AutoplayGate, boolean>> => ({
      manualPause: state.gates.manualPause,
      hover: state.gates.hover,
      focusWithin: state.gates.focusWithin,
      dragging: state.gates.dragging,
      visibilityHidden: state.gates.visibilityHidden,
      reducedMotion: state.gates.reducedMotion,
    });

    const setGate = (gate: AutoplayGate, active: boolean) => {
      dispatch(buildGateSet({ gate, value: active, source: "api" }));
    };

    const play = canControlPlaying
      ? () => {
          dispatch(buildAutoplaySetEnabled({ enabled: true, source: "api" }));
        }
      : (undefined as never);

    const pause = canControlPlaying
      ? () => {
          dispatch(buildAutoplaySetEnabled({ enabled: false, source: "api" }));
        }
      : (undefined as never);

    const toggle = canControlPlaying
      ? () => {
          dispatch(
            buildAutoplaySetEnabled({ enabled: !state.autoplay.enabled, source: "api" }),
          );
        }
      : (undefined as never);

    return {
      enabled: state.autoplay.enabled,
      isPlaying: autoplaySnapshot.plan.shouldRun,
      setGate,
      getGates,
      play,
      pause,
      toggle,
    } as AutoplayController<PlayingC>;
  }, [autoplaySnapshot.plan.shouldRun, canControlPlaying, state.autoplay.enabled, state.gates]);

  const engine: CarouselEngine<IndexC, PlayingC> = React.useMemo(
    () => ({
      index: state.index as unknown as number,
      isReady: state.virtual.window !== null,
      isDragging: state.isDragging,
      isAnimating: state.motion.isAnimating,
      renderCount,
      realIndexFromRenderIndex: (renderIndex: number) =>
        getSlotForRenderIndex(renderIndex).logicalIndex,
      refs: {
        root: internalRefs.root,
        viewport: internalRefs.viewport,
        track: internalRefs.track,
        slide: internalRefs.slide,
      },
      autoplay: autoplayController,
      goTo: (canNavigate
        ? (index: number, _opts?: { transitionDurationMs?: number }) => {
            dispatch(buildNavRequestGoto(index, "api"));
            executeNav({ kind: "goto", index, source: "api" });
          }
        : (undefined as never)) as CarouselEngine<IndexC, PlayingC>["goTo"],
      next: (canNavigate
        ? (_opts?: { transitionDurationMs?: number }) => {
            if (!can.canNext) return;
            dispatch(buildNavRequestNext("api"));
            executeNav({ kind: "next", source: "api" });
          }
        : (undefined as never)) as CarouselEngine<IndexC, PlayingC>["next"],
      prev: (canNavigate
        ? (_opts?: { transitionDurationMs?: number }) => {
            if (!can.canPrev) return;
            dispatch(buildNavRequestPrev("api"));
            executeNav({ kind: "prev", source: "api" });
          }
        : (undefined as never)) as CarouselEngine<IndexC, PlayingC>["prev"],
    }),
    [
      autoplayController,
      can.canNext,
      can.canPrev,
      canNavigate,
      executeNav,
      getSlotForRenderIndex,
      internalRefs.root,
      internalRefs.slide,
      internalRefs.track,
      internalRefs.viewport,
      renderCount,
      state.index,
      state.isDragging,
      state.motion.isAnimating,
      state.virtual.window,
    ],
  );

  const bindings: CarouselBindings = React.useMemo(() => {
    const getRootProps = <P extends React.ComponentPropsWithRef<"div"> & DataAttributes>(
      user?: P,
    ) =>
      getRootBindings(
        { label: normalized.label, ref: rootRef, id: ids.root },
        user as React.HTMLAttributes<HTMLElement> & DataAttributes,
      ) as unknown as P;

    const getViewportProps = <P extends React.ComponentPropsWithRef<"div"> & DataAttributes>(
      user?: P,
    ) =>
      getViewportBindings(
        { ref: viewportRef },
        { ...(user ?? {}), id: ids.viewport } as React.HTMLAttributes<HTMLElement> & DataAttributes,
      ) as unknown as P;

    const getTrackProps = <P extends React.ComponentPropsWithRef<"div"> & DataAttributes>(
      user?: P,
    ) =>
      getTrackBindings(
        { ref: trackRef },
        { ...(user ?? {}), id: ids.track } as React.HTMLAttributes<HTMLElement> & DataAttributes,
      ) as unknown as P;

    const getSlideProps = <P extends React.ComponentPropsWithRef<"div"> & DataAttributes>(
      renderIndex: number,
      user?: P,
    ) => {
      const slot = getSlotForRenderIndex(renderIndex);
      return getSlideBindings(
        {
          index: slot.logicalIndex,
          total: state.slideCount,
          ref: internalRefs.slide(slot.logicalIndex),
          id: ids.slide(slot.logicalIndex),
        },
        user as React.HTMLAttributes<HTMLElement> & DataAttributes,
      ) as unknown as P;
    };

    const getPrevButtonProps = <P extends React.ButtonHTMLAttributes<HTMLButtonElement> & DataAttributes>(
      user?: P,
    ) => {
      const base = getPrevButtonBindings(
        { canPrev: can.canPrev, controlsId: ids.viewport, id: ids.prevButton },
        user as React.ButtonHTMLAttributes<HTMLButtonElement> & DataAttributes,
      );
      return {
        ...base,
        onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
          (base.onClick as undefined | ((e: React.MouseEvent<HTMLButtonElement>) => void))?.(
            event,
          );
          handlePrev(event);
        },
      } as unknown as P;
    };

    const getNextButtonProps = <P extends React.ButtonHTMLAttributes<HTMLButtonElement> & DataAttributes>(
      user?: P,
    ) => {
      const base = getNextButtonBindings(
        { canNext: can.canNext, controlsId: ids.viewport, id: ids.nextButton },
        user as React.ButtonHTMLAttributes<HTMLButtonElement> & DataAttributes,
      );
      return {
        ...base,
        onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
          (base.onClick as undefined | ((e: React.MouseEvent<HTMLButtonElement>) => void))?.(
            event,
          );
          handleNext(event);
        },
      } as unknown as P;
    };

    const getListProps = <P extends React.ComponentPropsWithRef<"div"> & DataAttributes>(user?: P) => ({
      ...(user ?? {}),
    }) as P;

    const getDotProps = <P extends React.ButtonHTMLAttributes<HTMLButtonElement> & DataAttributes>(
      index: number,
      user?: P,
    ) => {
      const base = { ...(user ?? {}) } as P;
      return {
        ...base,
        "aria-controls": ids.viewport,
        "aria-current": index === state.index ? "true" : undefined,
        onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
          (base.onClick as undefined | ((e: React.MouseEvent<HTMLButtonElement>) => void))?.(event);
          handleGoTo(index, event);
        },
      } as P;
    };

    const getAutoplayToggleProps = <P extends React.ButtonHTMLAttributes<HTMLButtonElement> & DataAttributes>(
      user?: P,
    ) => {
      const base = { ...(user ?? {}) } as P;
      return {
        ...base,
        "aria-pressed": state.autoplay.enabled,
        onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
          (base.onClick as undefined | ((e: React.MouseEvent<HTMLButtonElement>) => void))?.(event);
          if (!canControlPlaying) return;
          dispatch(
            buildAutoplaySetEnabled({ enabled: !state.autoplay.enabled, source: "api" }),
          );
        },
      } as P;
    };

    const getAnnouncerProps = <P extends React.HTMLAttributes<HTMLElement> & DataAttributes>(
      user?: P,
    ) => ({
      ...getLiveRegionProps({ mode: liveMode, text: announcement }),
      ...user,
      id: ids.liveRegion,
    }) as P;

    return {
      getRootProps,
      getViewportProps,
      getTrackProps,
      getSlideProps,
      getPrevButtonProps,
      getNextButtonProps,
      pagination: {
        count: state.slideCount,
        index: state.index as unknown as number,
        getListProps,
        getDotProps,
      },
      autoplayToggle: {
        getButtonProps: getAutoplayToggleProps,
      },
      announcer: {
        message: announcement,
        getProps: getAnnouncerProps,
      },
    };
  },
    [
      announcement,
      can.canNext,
      can.canPrev,
      canControlPlaying,
      getSlotForRenderIndex,
      handleGoTo,
      handleNext,
      handlePrev,
      ids,
      internalRefs,
      liveMode,
      normalized.label,
      rootRef,
      state.autoplay.enabled,
      state.index,
      state.slideCount,
      trackRef,
      viewportRef,
    ],
  );

  return { engine, bindings };
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

interface NormalizedOptions {
  readonly initialState: CreateInitialStateOptions;
  readonly label: string;
  readonly align: SnapTarget;
  readonly smoothScroll: boolean;
  readonly indexReadonly: boolean;
  readonly playingReadonly: boolean;
}

function normalizeOptions<IndexC extends Controllable<number>, PlayingC extends Controllable<boolean>>(
  opts: UseCarouselOptions<IndexC, PlayingC>,
): NormalizedOptions {
  const axis = opts.layout?.axis ?? "x";
  const dir = opts.layout?.readingDirection ?? "ltr";
  const loop = opts.loop?.enabled ?? false;

  const { initialIndex, indexReadonly } = resolveIndexConfig(opts.index);
  const { enabled: autoplayEnabled, playingReadonly } = resolvePlayingConfig(
    opts.autoplay?.playing,
    opts.autoplay?.enabled,
  );

  const intervalMs = resolveAutoplayInterval(opts.autoplay?.dwellMs, opts.autoplay?.startDelayMs);

  const initialState: CreateInitialStateOptions = {
    axis,
    dir,
    loop,
    slideCount: opts.slideCount,
    initialIndex,
    autoplayEnabled,
    autoplayIntervalMs: intervalMs,
  };

  return {
    initialState,
    label: opts.accessibility?.label ?? "Carousel",
    align: opts.layout?.snapTo ?? "center",
    smoothScroll: !opts.motion?.disabled,
    indexReadonly,
    playingReadonly,
  };
}

function resolveIndexConfig(config: Controllable<number> | undefined): {
  readonly initialIndex: number;
  readonly indexReadonly: boolean;
} {
  if (!config) {
    return { initialIndex: 0, indexReadonly: false };
  }

  if (config.mode === "controlled") {
    const isReadonly = "readonly" in config && config.readonly === true;
    return { initialIndex: config.value, indexReadonly: isReadonly };
  }

  return { initialIndex: config.defaultValue ?? 0, indexReadonly: false };
}

function resolvePlayingConfig(
  config: Controllable<boolean> | undefined,
  fallbackEnabled?: boolean,
): { readonly enabled: boolean; readonly playingReadonly: boolean } {
  if (!config) {
    return { enabled: Boolean(fallbackEnabled ?? false), playingReadonly: false };
  }

  if (config.mode === "controlled") {
    const isReadonly = "readonly" in config && config.readonly === true;
    return { enabled: config.value, playingReadonly: isReadonly };
  }

  return { enabled: config.defaultValue ?? Boolean(fallbackEnabled ?? false), playingReadonly: false };
}

function resolveAutoplayInterval(
  dwell: number | ((ctx: { index: number; slideCount: number }) => number) | undefined,
  startDelayMs: number | undefined,
): number | undefined {
  if (typeof dwell === "number") return dwell;
  if (typeof startDelayMs === "number") return startDelayMs;
  return undefined;
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
