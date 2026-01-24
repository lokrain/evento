"use client";

import * as React from "react";

import { buildSettleAnnouncement } from "./a11y/announce/policy";
import { createCarouselA11yIds } from "./a11y/ids";

import {
  buildA11yAnnounce,
  buildA11yClearAnnouncement,
  buildA11ySetLiveMode,
  buildA11ySetAnnounceEnabled,
} from "./actions/builders/build-a11y";
import { buildAutoplaySetEnabled, buildGateSet } from "./actions/builders/build-autoplay";
import { buildMotionClear } from "./actions/builders/build-motion";
import {
  buildNavCommitIndex,
  buildNavRequestGoto,
  buildNavRequestNext,
  buildNavRequestPrev,
} from "./actions/builders/build-navigation";
import { buildVirtualSetEpoch, buildVirtualSetWindow } from "./actions/builders/build-virtual";

import { asIndex, asPx } from "./core/brands";
import type {
  AutoplayController,
  AutoplayGate,
  CarouselBindings,
  CarouselEngine,
  CarouselReturn,
  Controllable,
  CommitThreshold,
  Px,
  Uncontrolled,
  UseCarouselOptions,
} from "./core/types";

import { defaultCarouselPlatform } from "./carousel-platform";
import type { CarouselPlatform } from "./carousel-platform";

import { keydownToCommand } from "./dom/listeners/on-keydown";
import { createScrollHandler } from "./dom/listeners/on-scroll";
import { createRefs } from "./dom/refs/create-refs";

import { useCarouselDomGates } from "./orchestrator/use-carousel-gates";
import { useCarouselMeasure } from "./orchestrator/use-carousel-measure";

import { createAutoplayTicker } from "./model/autoplay/tick";
import { deriveAutoplay } from "./model/autoplay/wire-autoplay";

import {
  clearSettled,
  createInitialSettleState,
  notifyScrollEnd,
  resetSettleTracking,
  type SettleMachineState,
  sampleSettle,
} from "./model/settle/settle-machine";
import { createRafSettleSampler } from "./model/settle/settle-raf";
import { subscribeScrollEnd } from "./model/settle/settle-scrollend";

import { executeNav as executeNavModel } from "./model/nav/execute-nav";
import { computeVirtualUpdate, deriveRenderSlots } from "./model/virtual/wire-virtual";

import { reduceCarousel } from "./store/reducer";
import { createCarouselFacade } from "./store/facade";
import { selectCanNav } from "./store/selectors/select-can-nav";
import { selectPinnedIndices } from "./store/selectors/select-window";
import type { CarouselState } from "./store/state";
import { createInitialState } from "./store/state";
import { normalizeOptions } from "./store/normalize";

import { clampIndexNumber, computeCommittedIndexFromDom } from "./dom/geometry";

import { composeBindings } from "./bindings/compose-bindings";

const DEFAULT_COMMIT_THRESHOLD: CommitThreshold = { kind: "snap", value: 0.5 };

export function useCarousel<
  IndexC extends Controllable<number> = Uncontrolled<number>,
  PlayingC extends Controllable<boolean> = Uncontrolled<boolean>,
>(opts: UseCarouselOptions<IndexC, PlayingC>): CarouselReturn<IndexC, PlayingC> {
  return useCarouselWithPlatform(opts, defaultCarouselPlatform);
}

/**
 * INTERNAL ONLY.
 * Allows deterministic tests by injecting a platform (scroll writer).
 */
export function useCarouselWithPlatform<
  IndexC extends Controllable<number> = Uncontrolled<number>,
  PlayingC extends Controllable<boolean> = Uncontrolled<boolean>,
>(
  opts: UseCarouselOptions<IndexC, PlayingC>,
  platform: CarouselPlatform,
): CarouselReturn<IndexC, PlayingC> {
  const normalized = React.useMemo(() => normalizeOptions(opts), [opts]);
  const baselineLiveMode = opts.accessibility?.live ?? "polite";
  const announceChanges = opts.accessibility?.announceChanges ?? true;
  const interactionStep = React.useMemo(() => {
    const raw: number = opts.interaction?.step ?? 1;
    const parsed = Number.isFinite(raw) ? Math.trunc(raw) : 1;
    return Math.max(1, parsed);
  }, [opts.interaction?.step]);
  const isDraggable = opts.interaction?.draggable ?? true;
  const observeResize = opts.measure?.observeResize ?? true;
  const remeasureOnNextFrame = opts.measure?.remeasureOnNextFrame ?? true;
  const resumeAfterInteraction = opts.autoplay?.resumeAfterInteraction ?? false;
  const pauseWhenHidden = opts.autoplay?.pauseWhenHidden ?? true;
  const commitThreshold = React.useMemo(
    () => opts.interaction?.commitThreshold ?? DEFAULT_COMMIT_THRESHOLD,
    [opts.interaction?.commitThreshold],
  );

  const canNavigate = !normalized.indexReadonly;
  const canControlPlaying = !normalized.playingReadonly;

  // -----------------------------
  // Store (single writer)
  // -----------------------------
  const [state, dispatch] = React.useReducer(
    reduceCarousel,
    normalized.initialState,
    createInitialState,
  );
  const facade = React.useMemo(() => createCarouselFacade(state), [state]);

  // Keep latest state in a ref for stable event handlers.
  const stateRef = React.useRef<CarouselState>(state);
  React.useLayoutEffect(() => {
    stateRef.current = state;
  }, [state]);

  const externalIndexCommitRef = React.useRef<number | null>(null);
  const lastIndexNotifiedRef = React.useRef<number>(state.index as unknown as number);

  const externalPlayingCommitRef = React.useRef<boolean | null>(null);
  const lastPlayingNotifiedRef = React.useRef<boolean>(state.autoplay.enabled);
  const autoplayTickerRef = React.useRef<ReturnType<typeof createAutoplayTicker> | null>(null);
  const autoplayInteractionBlockRef = React.useRef<boolean>(false);
  const prevAutoplayEnabledRef = React.useRef<boolean>(state.autoplay.enabled);

  // -----------------------------
  // DOM refs (dumb plumbing)
  // -----------------------------
  const internalRefs = React.useMemo(() => createRefs(), []);
  const latestScrollPxRef = React.useRef<Px>(asPx(0));

  // Settle machine state (owned here; driven by RAF sampler).
  const settleRef = React.useRef<SettleMachineState>(createInitialSettleState());
  const settleTokenRef = React.useRef<number>(0);

  // Loop seam tracking for virtualization epoch bump.
  const lastSeamBucketRef = React.useRef<number>(0);

  // Stable DOM ids for aria-controls.
  const rawId = React.useId();
  const ids = React.useMemo(() => createCarouselA11yIds(String(rawId)), [rawId]);
  const controlsId = opts.accessibility?.controlsId ?? ids.viewport;

  // -----------------------------
  // A11y preference synchronization
  // -----------------------------
  React.useEffect(() => {
    dispatch(
      buildA11ySetAnnounceEnabled({
        enabled: announceChanges,
        source: "policy",
      }),
    );
  }, [announceChanges, dispatch]);

  // -----------------------------
  // Controlled state sync (index + autoplay playing)
  // -----------------------------
  React.useEffect(() => {
    const indexConfig = opts.index;
    if (!indexConfig || indexConfig.mode !== "controlled") return;

    const next = clampIndexNumber(indexConfig.value, state.slideCount, state.loop);
    const current = stateRef.current.index as unknown as number;
    if (current === next) return;

    externalIndexCommitRef.current = next;
    dispatch(buildNavCommitIndex({ index: next, source: "external" }));
  }, [dispatch, opts.index, state.loop, state.slideCount]);

  React.useEffect(() => {
    const playingConfig = opts.autoplay?.playing;
    if (!playingConfig || playingConfig.mode !== "controlled") return;

    const next = Boolean(playingConfig.value);
    const current = stateRef.current.autoplay.enabled;
    if (current === next) return;

    externalPlayingCommitRef.current = next;
    dispatch(buildAutoplaySetEnabled({ enabled: next, source: "api" }));
  }, [dispatch, opts.autoplay?.playing]);

  // -----------------------------
  // Hot path: scroll sink + scroll listener
  // -----------------------------
  const scrollSink = React.useMemo(
    () => ({
      write(px: Px) {
        latestScrollPxRef.current = px;
      },
    }),
    [],
  );

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

  const collectSlidesForCommit = React.useCallback(() => {
    const viewport = internalRefs.state.viewport;
    if (!viewport) return internalRefs.state.slides;

    const nodes = viewport.querySelectorAll<HTMLElement>("[data-carousel-slide-index]");
    if (nodes.length === 0) return internalRefs.state.slides;

    const map = new Map<number, HTMLElement | null>();
    for (const node of nodes) {
      const raw = node.dataset.carouselSlideIndex;
      if (!raw) continue;
      const value = Number(raw);
      if (!Number.isFinite(value)) continue;
      map.set(Math.trunc(value), node);
    }
    return map;
  }, [internalRefs]);

  // Debug-only: commit index on scroll end to keep engine index in sync for tests.
  React.useEffect(() => {
    if (!opts.debug) return;
    const viewport = internalRefs.state.viewport;
    if (!viewport) return;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      if (timeoutId !== null) {
        globalThis.clearTimeout(timeoutId);
      }
      timeoutId = globalThis.setTimeout(() => {
        timeoutId = null;
        const s = stateRef.current;
        const committed = computeCommittedIndexFromDom({
          axis: s.axis,
          align: normalized.align,
          viewport: internalRefs.state.viewport,
          slides: collectSlidesForCommit(),
          slideCount: s.slideCount,
          loop: s.loop,
          fallbackIndex: s.index as unknown as number,
          commitThreshold,
        });

        dispatch(buildNavCommitIndex({ index: committed, source: "external" }));
      }, 120);
    };

    viewport.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (timeoutId !== null) {
        globalThis.clearTimeout(timeoutId);
      }
      viewport.removeEventListener("scroll", onScroll);
    };
  }, [collectSlidesForCommit, commitThreshold, dispatch, internalRefs, normalized.align, opts.debug]);

  // -----------------------------
  // RAF settle sampler (stable)
  // -----------------------------
  const rafSampler = React.useMemo(() => {
    return createRafSettleSampler({
      shouldContinue: () =>
        settleRef.current.pendingToken !== null &&
        settleRef.current.settledToken === null,
      onFrame: () => {
        // Boundary: sample settle (not the hot-path scroll event)
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
          slides: collectSlidesForCommit(),
          slideCount: s.slideCount,
          loop: s.loop,
          fallbackIndex: s.index as unknown as number,
          commitThreshold,
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
          if (opts.debug) {
            const prev =
              (globalThis as unknown as { __carouselDebug?: { lastAnnouncement?: string | null } })
                .__carouselDebug ?? {};
            (globalThis as unknown as { __carouselDebug?: typeof prev & { lastAnnouncement?: string } })
              .__carouselDebug = { ...prev, lastAnnouncement: announcement };
          }
          dispatch(buildA11yAnnounce({ text: announcement, source: "policy" }));
        }

        dispatch(buildMotionClear("reset"));

        settleRef.current = clearSettled(settleRef.current);
      },
    });
  }, [
    collectSlidesForCommit,
    commitThreshold,
    dispatch,
    internalRefs.state.slides,
    internalRefs.state.viewport,
    normalized.align,
    opts.debug,
  ]);

  // scrollend fast-path: notify + ensure RAF is running.
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
  // Navigation executor (delegated to model)
  // -----------------------------
  const executeNav = React.useCallback(
    (params: {
      readonly kind: "next" | "prev" | "goto";
      readonly index?: number;
      readonly source: "api" | "keyboard" | "button" | "autoplay";
    }) => {
      const s = stateRef.current;

      executeNavModel(
        { kind: params.kind, index: params.index, source: params.source },
        {
          platform,
          dispatch,

          viewport: internalRefs.state.viewport,
          slides: internalRefs.state.slides,

          axis: s.axis,
          align: normalized.align,

          loop: s.loop,
          slideCount: s.slideCount,

          currentIndex: s.index as unknown as number,

          reducedMotion: s.gates.reducedMotion,
          smoothScrollEnabled: normalized.smoothScroll,

          latestScrollPx: latestScrollPxRef.current,

          settle: settleRef.current,
          settleToken: settleTokenRef.current,
          setSettle: (next) => {
            settleRef.current = next;
          },
          setSettleToken: (next) => {
            settleTokenRef.current = next;
          },

          startRafSampler: () => {
            rafSampler.start();
          },
        },
      );

      const viewport = internalRefs.state.viewport;
      if (viewport) {
        const raw = s.axis === "x" ? viewport.scrollLeft : viewport.scrollTop;
        if (Number.isFinite(raw)) {
          latestScrollPxRef.current = asPx(raw);
        }
      }
    },
    [dispatch, internalRefs, normalized.align, normalized.smoothScroll, platform, rafSampler],
  );

  const maybeStopAutoplayAfterInteraction = React.useCallback(() => {
    if (resumeAfterInteraction) return;
    if (!canControlPlaying) return;
    autoplayInteractionBlockRef.current = true;
    if (stateRef.current.autoplay.enabled) {
      dispatch(buildAutoplaySetEnabled({ enabled: false, source: "policy" }));
    }
    autoplayTickerRef.current?.stop();
  }, [canControlPlaying, dispatch, resumeAfterInteraction]);

  // -----------------------------
  // DOM gates (focus, hover, visibility, reduced motion, dragging)
  // -----------------------------
  useCarouselDomGates({
    internalRefs,
    dispatch,
    isDraggable,
    pauseWhenHidden,
    onPointerDown: maybeStopAutoplayAfterInteraction,
    onFocusWithinStart: maybeStopAutoplayAfterInteraction,
  });

  // -----------------------------
  // Pointer dragging (mouse/touch)
  // -----------------------------
  React.useEffect(() => {
    const viewport = internalRefs.state.viewport;
    if (!viewport) return;
    if (!isDraggable) return;

    let activePointerId: number | null = null;
    let startPoint = 0;
    let startScroll = 0;
    let dragging = false;

    const thresholdPx = 4;

    const getPoint = (event: PointerEvent) =>
      stateRef.current.axis === "x" ? event.clientX : event.clientY;

    const onPointer = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;

      if (event.type === "pointerdown") {
        activePointerId = event.pointerId;
        dragging = false;
        startPoint = getPoint(event);
        startScroll =
          stateRef.current.axis === "x" ? viewport.scrollLeft : viewport.scrollTop;
        viewport.setPointerCapture?.(event.pointerId);
        return;
      }

      if (activePointerId === null || event.pointerId !== activePointerId) return;

      if (event.type === "pointermove") {
        const current = getPoint(event);
        const total = current - startPoint;

        if (!dragging && Math.abs(total) < thresholdPx) {
          return;
        }

        dragging = true;
        const next = startScroll - total;

        if (stateRef.current.axis === "x") {
          viewport.scrollLeft = next;
        } else {
          viewport.scrollTop = next;
        }

        if (event.cancelable) {
          event.preventDefault();
        }
        return;
      }

      if (event.type === "pointerup" || event.type === "pointercancel") {
        activePointerId = null;
        dragging = false;
        viewport.releasePointerCapture?.(event.pointerId);
      }
    };

    viewport.addEventListener("pointerdown", onPointer);
    viewport.addEventListener("pointermove", onPointer, { passive: false });
    viewport.addEventListener("pointerup", onPointer);
    viewport.addEventListener("pointercancel", onPointer);

    return () => {
      viewport.removeEventListener("pointerdown", onPointer);
      viewport.removeEventListener("pointermove", onPointer);
      viewport.removeEventListener("pointerup", onPointer);
      viewport.removeEventListener("pointercancel", onPointer);
    };
  }, [internalRefs, isDraggable]);

  // -----------------------------
  // Measurement wiring (viewport + slides)
  // -----------------------------
  useCarouselMeasure({
    internalRefs,
    stateRef,
    dispatch,
    slideCount: state.slideCount,
    observeResize,
    remeasureOnNextFrame,
  });

  const navigateByStep = React.useCallback(
    (direction: "next" | "prev", source: "api" | "keyboard" | "button") => {
      if (interactionStep <= 1) {
        if (direction === "prev") {
          dispatch(buildNavRequestPrev(source));
          executeNav({ kind: "prev", source });
        } else {
          dispatch(buildNavRequestNext(source));
          executeNav({ kind: "next", source });
        }
        return;
      }

      const s = stateRef.current;
      const delta = direction === "next" ? interactionStep : -interactionStep;
      const target = clampIndexNumber((s.index as unknown as number) + delta, s.slideCount, s.loop);

      dispatch(buildNavRequestGoto(target, source));
      executeNav({ kind: "goto", index: target, source });
    },
    [dispatch, executeNav, interactionStep],
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
      maybeStopAutoplayAfterInteraction();
      navigateByStep(cmd, "keyboard");
    };

    root.addEventListener("keydown", handler, keydownOptions);
    return () => root.removeEventListener("keydown", handler, keydownOptions);
  }, [internalRefs, maybeStopAutoplayAfterInteraction, navigateByStep]);

  // -----------------------------
  // Autoplay derivation (single source of truth)
  // -----------------------------
  const autoplayDerived = React.useMemo(() => {
    return deriveAutoplay({
      autoplayEnabled: state.autoplay.enabled,
      autoplayIntervalMs: state.autoplay.intervalMs as unknown as number,
      slideCount: state.slideCount,
      gates: {
        manualPause: state.gates.manualPause,
        hover: state.gates.hover,
        focusWithin: state.gates.focusWithin,
        visibilityHidden: state.gates.visibilityHidden,
        dragging: state.gates.dragging,
        reducedMotion: state.gates.reducedMotion,
      },
      announceEnabled: state.a11y.announceEnabled,
      baselineLiveMode,
    });
  }, [
    state.a11y.announceEnabled,
    state.autoplay.enabled,
    state.autoplay.intervalMs,
    state.gates.dragging,
    state.gates.focusWithin,
    state.gates.hover,
    state.gates.manualPause,
    state.gates.reducedMotion,
    state.gates.visibilityHidden,
    state.slideCount,
    baselineLiveMode,
  ]);

  // -----------------------------
  // External change notifications (index + autoplay playing)
  // -----------------------------
  React.useEffect(() => {
    const next = state.index as unknown as number;
    if (lastIndexNotifiedRef.current === next) return;
    lastIndexNotifiedRef.current = next;

    if (externalIndexCommitRef.current === next) {
      externalIndexCommitRef.current = null;
      return;
    }

    const indexConfig = opts.index;
    if (indexConfig) {
      if (indexConfig.mode === "controlled") {
        if ("onChange" in indexConfig) {
          indexConfig.onChange?.(next);
        }
      } else {
        indexConfig.onChange?.(next);
      }
    }

    opts.onIndexChange?.(next);
    opts.onSettle?.(next);
  }, [opts.index, opts.onIndexChange, opts.onSettle, state.index]);

  React.useEffect(() => {
    const next = state.autoplay.enabled;
    if (lastPlayingNotifiedRef.current === next) return;
    lastPlayingNotifiedRef.current = next;

    if (externalPlayingCommitRef.current === next) {
      externalPlayingCommitRef.current = null;
      return;
    }

    const playingConfig = opts.autoplay?.playing;
    if (playingConfig) {
      if (playingConfig.mode === "controlled") {
        if ("onChange" in playingConfig) {
          playingConfig.onChange?.(next);
        }
      } else {
        playingConfig.onChange?.(next);
      }
    }
  }, [opts.autoplay?.playing, state.autoplay.enabled]);

  // -----------------------------
  // Debug diagnostics (test-only)
  // -----------------------------
  React.useEffect(() => {
    if (!opts.debug) return;

    const win = state.virtual.window;
    const prev = (globalThis as unknown as {
      __carouselDebug?: { lastAnnouncement?: string | null; commitIndex?: (index: number) => void };
    }).__carouselDebug;
    const debug = {
      index: state.index as unknown as number,
      pinned: Array.from(state.virtual.pinned),
      lastAnnouncement: state.a11y.lastAnnouncement ?? prev?.lastAnnouncement ?? null,
      liveMode: state.a11y.liveMode,
      commitIndex: (index: number) => {
        dispatch(buildNavCommitIndex({ index, source: "external" }));
      },
      window: win
        ? {
            start: win.start as unknown as number,
            end: win.end as unknown as number,
            size: win.size as unknown as number,
          }
        : null,
    };

    (globalThis as unknown as { __carouselDebug?: typeof debug }).__carouselDebug = debug;
  }, [opts.debug, state.index, state.virtual.pinned, state.virtual.window]);

  // -----------------------------
  // Autoplay ticker (stable, Strict Mode safe)
  // -----------------------------
  const autoplayTicker = React.useMemo(() => {
    return createAutoplayTicker(() => {
      const s = stateRef.current;
      if (!resumeAfterInteraction && autoplayInteractionBlockRef.current) return;
      if (!s.autoplay.enabled) return;
      if (s.slideCount <= 1) return;
      if (s.gates.manualPause) return;
      if (s.gates.hover) return;
      if (s.gates.focusWithin) return;
      if (s.gates.visibilityHidden) return;
      if (s.gates.dragging) return;
      if (s.gates.reducedMotion) return;
      const can = selectCanNav(s);
      if (!can.canNext) return;

      dispatch(buildNavRequestNext("autoplay"));
      executeNav({ kind: "next", source: "autoplay" });
    });
  }, [dispatch, executeNav, resumeAfterInteraction]);
  autoplayTickerRef.current = autoplayTicker;

  React.useEffect(() => {
    return () => {
      autoplayTicker.stop();
    };
  }, [autoplayTicker]);

  React.useEffect(() => {
    if (resumeAfterInteraction) {
      autoplayInteractionBlockRef.current = false;
    }
  }, [resumeAfterInteraction]);

  React.useEffect(() => {
    const prev = prevAutoplayEnabledRef.current;
    if (!prev && state.autoplay.enabled) {
      autoplayInteractionBlockRef.current = false;
    }
    prevAutoplayEnabledRef.current = state.autoplay.enabled;
  }, [state.autoplay.enabled]);

  // Autoplay boundary effect: policy -> start/stop ticker + a11y live mode.
  React.useEffect(() => {
    dispatch(
      buildA11ySetLiveMode({
        mode: autoplayDerived.plan.desiredLiveMode,
        source: "policy",
      }),
    );

    if (autoplayDerived.plan.shouldRun) {
      autoplayTicker.start(state.autoplay.intervalMs as unknown as number);
    } else {
      autoplayTicker.stop();
    }

    return () => {
      autoplayTicker.stop();
    };
  }, [
    autoplayDerived.plan.desiredLiveMode,
    autoplayDerived.plan.shouldRun,
    autoplayTicker,
    dispatch,
    state.autoplay.intervalMs,
  ]);

  // -----------------------------
  // Virtualization: compute window on boundaries (not on scroll)
  // -----------------------------
  React.useEffect(() => {
    const pinned = selectPinnedIndices(state);

    const upd = computeVirtualUpdate({
      slideCount: state.slideCount,
      loop: state.loop,
      index: asIndex(state.index as unknown as number),
      windowSize: state.virtual.windowSize,
      overscan: state.virtual.overscan,
      pinned,
      prevEpoch: state.virtual.epoch,
      prevSeamBucket: lastSeamBucketRef.current,
    });

    // Always persist seam bucket ref (contract: keep ref consistent).
    lastSeamBucketRef.current = upd.nextSeamBucket;

    dispatch(buildVirtualSetWindow(upd.window));
    if (upd.nextEpoch !== null) {
      dispatch(buildVirtualSetEpoch(upd.nextEpoch, "loop-seam"));
    }
  }, [dispatch, state]);

  // -----------------------------
  // Derived virtual slots for rendering
  // -----------------------------
  const window = facade.virtualWindow;
  const epoch = facade.virtualEpoch;

  const renderSlots = React.useMemo(() => {
    if (!window) return [];
    return deriveRenderSlots({
      window,
      slideCount: state.slideCount,
      loop: state.loop,
      epoch,
    });
  }, [epoch, state.loop, state.slideCount, window]);

  // -----------------------------
  // A11y live region + announcement
  // -----------------------------
  const liveMode = facade.liveMode;
  const announceEnabled = facade.announceEnabled;
  const announcement = announceEnabled ? facade.lastAnnouncement : null;

  React.useEffect(() => {
    if (announcement === null) return;
    const delay = opts.debug ? 50 : 0;
    const id = globalThis.setTimeout(() => {
      dispatch(buildA11yClearAnnouncement("policy"));
    }, delay);
    return () => {
      globalThis.clearTimeout(id);
    };
  }, [announcement, dispatch, opts.debug]);

  // Cleanup on unmount.
  React.useEffect(() => {
    return () => {
      settleRef.current = resetSettleTracking(settleRef.current);
      rafSampler.stop();
      autoplayTicker.stop();
    };
  }, [autoplayTicker, rafSampler]);

  // -----------------------------
  // Bindings (composed consumer API)
  // -----------------------------
  const can = facade.canNav;

  const rootRef = React.useMemo(() => internalRefs.root, [internalRefs]);
  const viewportRef = React.useMemo(() => internalRefs.viewport, [internalRefs]);
  const trackRef = React.useMemo(() => internalRefs.track, [internalRefs]);

  const renderCount = renderSlots.length > 0 ? renderSlots.length : state.slideCount;

  const logicalIndexFromRenderIndex = React.useCallback(
    (renderIndex: number) =>
      (renderSlots[renderIndex] ?? {
        key: `fallback-${renderIndex}`,
        logicalIndex: clampIndexNumber(renderIndex, state.slideCount, state.loop),
      }).logicalIndex,
    [renderSlots, state.loop, state.slideCount],
  );

  const handlePrev = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (event.defaultPrevented) return;
      if (!can.canPrev) return;
      if (!canNavigate) return;
      maybeStopAutoplayAfterInteraction();
      navigateByStep("prev", "button");
    },
    [can.canPrev, canNavigate, maybeStopAutoplayAfterInteraction, navigateByStep],
  );

  const handleNext = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (event.defaultPrevented) return;
      if (!can.canNext) return;
      if (!canNavigate) return;
      maybeStopAutoplayAfterInteraction();
      navigateByStep("next", "button");
    },
    [can.canNext, canNavigate, maybeStopAutoplayAfterInteraction, navigateByStep],
  );

  const handleGoTo = React.useCallback(
    (toIndex: number, event: React.MouseEvent<HTMLButtonElement>) => {
      if (event.defaultPrevented) return;
      if (!canNavigate) return;
      maybeStopAutoplayAfterInteraction();
      dispatch(buildNavRequestGoto(toIndex, "button"));
      executeNav({ kind: "goto", index: toIndex, source: "button" });
    },
    [canNavigate, dispatch, executeNav, maybeStopAutoplayAfterInteraction],
  );

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
          buildAutoplaySetEnabled({
            enabled: !state.autoplay.enabled,
            source: "api",
          }),
        );
      }
      : (undefined as never);

    return {
      enabled: state.autoplay.enabled,
      isPlaying: autoplayDerived.plan.shouldRun,
      setGate,
      getGates,
      play,
      pause,
      toggle,
    } as AutoplayController<PlayingC>;
  }, [
    autoplayDerived.plan.shouldRun,
    canControlPlaying,
    dispatch,
    state.autoplay.enabled,
    state.gates,
  ]);

  const engine: CarouselEngine<IndexC, PlayingC> = React.useMemo(
    () => ({
      index: state.index as unknown as number,
      isReady: state.virtual.window !== null,
      isDragging: state.isDragging,
      isAnimating: state.motion.isAnimating,
      renderCount,
      realIndexFromRenderIndex: (renderIndex: number) =>
        logicalIndexFromRenderIndex(renderIndex),
      refs: {
        root: internalRefs.root,
        viewport: internalRefs.viewport,
        track: internalRefs.track,
        slide: internalRefs.slide,
      },
      autoplay: autoplayController,

      goTo: (canNavigate
        ? (toIndex: number, _opts?: { transitionDurationMs?: number }) => {
          maybeStopAutoplayAfterInteraction();
          dispatch(buildNavRequestGoto(toIndex, "api"));
          executeNav({ kind: "goto", index: toIndex, source: "api" });
        }
        : (undefined as never)) as CarouselEngine<IndexC, PlayingC>["goTo"],

      next: (canNavigate
        ? (_opts?: { transitionDurationMs?: number }) => {
          if (!can.canNext) return;
          maybeStopAutoplayAfterInteraction();
          navigateByStep("next", "api");
        }
        : (undefined as never)) as CarouselEngine<IndexC, PlayingC>["next"],

      prev: (canNavigate
        ? (_opts?: { transitionDurationMs?: number }) => {
          if (!can.canPrev) return;
          maybeStopAutoplayAfterInteraction();
          navigateByStep("prev", "api");
        }
        : (undefined as never)) as CarouselEngine<IndexC, PlayingC>["prev"],
    }),
    [
      autoplayController,
      can.canNext,
      can.canPrev,
      canNavigate,
      dispatch,
      executeNav,
      internalRefs.root,
      internalRefs.slide,
      internalRefs.track,
      internalRefs.viewport,
      logicalIndexFromRenderIndex,
      maybeStopAutoplayAfterInteraction,
      navigateByStep,
      renderCount,
      state.index,
      state.isDragging,
      state.motion.isAnimating,
      state.virtual.window,
    ],
  );

  const bindings: CarouselBindings = React.useMemo(() => {
    return composeBindings({
      normalizedLabel: normalized.label,
      rootTabIndex: opts.accessibility?.tabIndex,
      controlsId,
      ids,
      rootRef,
      viewportRef,
      trackRef,
      slideRefForIndex: (logicalIndex) => internalRefs.slide(logicalIndex),

      canPrev: can.canPrev,
      canNext: can.canNext,

      slideCount: state.slideCount,
      index: state.index as unknown as number,

      canNavigate,
      canControlPlaying,

      axis: state.axis,
      isDraggable,
      isDragging: state.isDragging,

      autoplayEnabled: state.autoplay.enabled,

      liveMode,
      announcement,

      handlePrev,
      handleNext,
      handleGoTo,

      dispatchAutoplayToggle: () => {
        dispatch(
          buildAutoplaySetEnabled({
            enabled: !state.autoplay.enabled,
            source: "api",
          }),
        );
      },

      logicalIndexFromRenderIndex,
    });
  }, [
    announcement,
    can.canNext,
    can.canPrev,
    canControlPlaying,
    canNavigate,
    controlsId,
    dispatch,
    handleGoTo,
    handleNext,
    handlePrev,
    ids,
    internalRefs,
    isDraggable,
    state.isDragging,
    liveMode,
    logicalIndexFromRenderIndex,
    normalized.label,
    rootRef,
    state.autoplay.enabled,
    state.axis,
    state.index,
    state.slideCount,
    trackRef,
    viewportRef,
  ]);

  return { engine, bindings };
}
