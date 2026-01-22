// src/components/headless/carousel/engine/use-carousel.tsx
import { useMemo, useState } from "react";
import type {
  AutoplayGate,
  CarouselBindings,
  CarouselEngine,
  CarouselReturn,
  Controllable,
  Controlled,
  Uncontrolled,
  UseCarouselOptions,
} from "./types-public";
import { createAutoplayController, createNavigationCommands } from "./capabilities";
import { normalizeOptions } from "./options";
import { clampIndexLoopAware, mod } from "../model/index-math";
import { usePrefersReducedMotion } from "../platform/use-prefers-reduced-motion";

/**
 * Temporary minimal implementation to satisfy public surface.
 * Crucially: capability-typed commands MUST be removed in readonly modes.
 */
export function useCarousel<
  IndexC extends Controllable<number> = Uncontrolled<number>,
  PlayingC extends Controllable<boolean> = Uncontrolled<boolean>,
>(options: UseCarouselOptions<IndexC, PlayingC>): CarouselReturn<IndexC, PlayingC> {
  const normalized = useMemo(() => normalizeOptions<IndexC, PlayingC>(options), [options]);
  const prefersReducedMotion = usePrefersReducedMotion();

  const effectiveAutoplayEnabled = normalized.autoplay.enabled && normalized.slideCount > 1;

  const [internalIndex, setInternalIndex] = useState<number>(() => {
    const idx = normalized.index;
    if (idx && idx.mode === "controlled") return idx.value;
    if (idx && idx.mode === "uncontrolled" && typeof idx.defaultValue === "number") return idx.defaultValue;
    return 0;
  });

  const [autoplayState, setAutoplayState] = useState<boolean>(() => {
    const playing = normalized.autoplay.playing;
    if (playing && playing.mode === "controlled") return playing.value;
    if (playing && playing.mode === "uncontrolled" && typeof playing.defaultValue === "boolean") return playing.defaultValue;
    return false;
  });

  const [gates, setGates] = useState<Record<AutoplayGate, boolean>>({
    hover: false,
    focusWithin: false,
    dragging: false,
    visibilityHidden: false,
    reducedMotion: false,
    manual: false,
  });

  const isControlledIndex = normalized.index?.mode === "controlled";
  const isReadonlyIndex = normalized.index?.mode === "controlled" && (normalized.index as Controlled<number> & { readonly?: boolean }).readonly === true;

  const getCurrentIndex = () => (isControlledIndex ? (normalized.index as Controlled<number>).value : internalIndex);

  const applyIndex = (nextIndex: number) => {
    const clamped = clampIndexLoopAware(nextIndex, normalized.slideCount, normalized.loop.enabled);
    if (isReadonlyIndex) return;
    if (isControlledIndex) {
      const ctrl = normalized.index as Controlled<number>;
      ctrl.onChange?.(clamped);
    } else {
      setInternalIndex(clamped);
      normalized.index?.onChange?.(clamped);
    }
    normalized.onIndexChange?.(clamped);
  };

  const nav = useMemo(
    () =>
      createNavigationCommands(normalized.index ?? ({ mode: "uncontrolled" } as Uncontrolled<number>) as IndexC, {
        goTo: (i, _opts) => applyIndex(i),
        next: (_opts) => applyIndex(getCurrentIndex() + normalized.interaction.step),
        prev: (_opts) => applyIndex(getCurrentIndex() - normalized.interaction.step),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [normalized.index, normalized.interaction.step, normalized.loop.enabled, normalized.slideCount, internalIndex],
  );

  const autoplay = useMemo(
    () =>
      createAutoplayController(normalized.autoplay.playing ?? ({ mode: "uncontrolled" } as Uncontrolled<boolean>) as PlayingC, {
        enabled: effectiveAutoplayEnabled,
        getIsPlaying: () => (effectiveAutoplayEnabled ? autoplayState : false),
        setGate: (gate, active) => setGates((g) => ({ ...g, [gate]: active })),
        getGates: () => gates,
        play: () => {
          if (!effectiveAutoplayEnabled) return setAutoplayState(false);
          setAutoplayState(true);
        },
        pause: () => setAutoplayState(false),
        toggle: () => {
          if (!effectiveAutoplayEnabled) return setAutoplayState(false);
          setAutoplayState((v) => !v);
        },
      }),
    [normalized.autoplay, effectiveAutoplayEnabled, gates, autoplayState],
  );

  const engine: CarouselEngine<IndexC, PlayingC> = useMemo(
    () => ({
      ...nav,
      index: getCurrentIndex(),
      isReady: true,
      isDragging: false,
      isAnimating: false,
      renderCount: normalized.slideCount,
      realIndexFromRenderIndex: (renderIndex: number) => mod(renderIndex, normalized.slideCount),
      refs: {
        root: () => {},
        viewport: () => {},
        track: () => {},
        slide: () => () => {},
      },
      autoplay,
    }),
    [nav, normalized.slideCount, autoplay, internalIndex],
  );

  const bindings: CarouselBindings = useMemo(
    () => ({
      getRootProps: <P extends React.ComponentPropsWithRef<"div">>(user?: P) => ({
        role: "region",
        "aria-label": normalized.accessibility.label,
        ...user,
        ref: user?.ref,
      } as P),
      getViewportProps: <P extends React.ComponentPropsWithRef<"div">>(user?: P) => ({
        id: normalized.accessibility.controlsId ?? user?.id,
        ...user,
        ref: user?.ref,
      } as P),
      getTrackProps: <P extends React.ComponentPropsWithRef<"div">>(user?: P) => ({
        ...user,
        ref: user?.ref,
      } as P),
      getSlideProps: <P extends React.ComponentPropsWithRef<"div">>(renderIndex: number, user?: P) => ({
        role: "group",
        "aria-roledescription": "slide",
        "aria-label": `Slide ${mod(renderIndex, normalized.slideCount) + 1} of ${normalized.slideCount}`,
        ...user,
        ref: user?.ref,
      } as P),
      getPrevButtonProps: <P extends React.ComponentPropsWithRef<"button">>(user?: P) => ({
        "aria-label": (user as any)?.["aria-label"] ?? "Previous slide",
        disabled: isReadonlyIndex || (user as any)?.disabled,
        ...user,
      } as P),
      getNextButtonProps: <P extends React.ComponentPropsWithRef<"button">>(user?: P) => ({
        "aria-label": (user as any)?.["aria-label"] ?? "Next slide",
        disabled: isReadonlyIndex || (user as any)?.disabled,
        ...user,
      } as P),
      pagination: {
        count: normalized.slideCount,
        index: engine.index,
        getListProps: <P extends React.ComponentPropsWithRef<"div">>(user?: P) => ({ ...user } as P),
        getDotProps: <P extends React.ComponentPropsWithRef<"button">>(_index: number, user?: P) => ({
          "aria-label": (user as any)?.["aria-label"] ?? "Go to slide",
          disabled: isReadonlyIndex || (user as any)?.disabled,
          ...user,
        } as P),
      },
      autoplayToggle: {
        getButtonProps: <P extends React.ButtonHTMLAttributes<HTMLButtonElement>>(user?: P) => ({
          "aria-label": (user as any)?.["aria-label"] ?? "Toggle autoplay",
          disabled: prefersReducedMotion || (user as any)?.disabled,
          ...user,
        } as P),
      },
      announcer: {
        message: null,
        getProps: <P extends React.HTMLAttributes<HTMLElement>>(user?: P) => ({
          "aria-live": normalized.accessibility.live,
          "aria-atomic": true,
          role: (user as any)?.role ?? "status",
          ...user,
        } as P),
      },
    }),
    [engine.index, normalized.slideCount, normalized.accessibility.label, normalized.accessibility.live, normalized.accessibility.controlsId, isReadonlyIndex, prefersReducedMotion],
  );

  return { engine, bindings };
}

export default useCarousel;
