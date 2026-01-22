// src/components/headless/carousel/engine/capabilities.ts
import type {
  AutoplayController,
  AutoplayGate,
  Controllable,
  Controlled,
  NavigationCommands,
} from "./types-public";

export function isReadonlyControlled<T>(
  c: Controllable<T>,
): c is Extract<Controlled<T>, { mode: "controlled"; readonly: true }> {
  return c.mode === "controlled" && (c as { readonly?: boolean }).readonly === true;
}

export function createNavigationCommands<IndexC extends Controllable<number>>(
  index: IndexC,
  impl: {
    goTo: (index: number, opts?: { transitionDurationMs?: number }) => void;
    next: (opts?: { transitionDurationMs?: number }) => void;
    prev: (opts?: { transitionDurationMs?: number }) => void;
  },
): NavigationCommands<IndexC> {
  if (isReadonlyControlled(index)) {
    // readonly => commands are removed at compile time
    return {
      goTo: undefined as never,
      next: undefined as never,
      prev: undefined as never,
    } as NavigationCommands<IndexC>;
  }

  // writable/uncontrolled => commands exist
  return {
    goTo: impl.goTo,
    next: impl.next,
    prev: impl.prev,
  } as NavigationCommands<IndexC>;
}

export function createAutoplayController<PlayingC extends Controllable<boolean>>(
  playing: PlayingC,
  impl: {
    enabled: boolean;
    getIsPlaying: () => boolean;

    setGate: (gate: AutoplayGate, active: boolean) => void;
    getGates: () => Readonly<Record<AutoplayGate, boolean>>;

    play: () => void;
    pause: () => void;
    toggle: () => void;
  },
): AutoplayController<PlayingC> {
  if (isReadonlyControlled(playing)) {
    return {
      enabled: impl.enabled,
      isPlaying: impl.getIsPlaying(),
      setGate: impl.setGate,
      getGates: impl.getGates,
      play: undefined as never,
      pause: undefined as never,
      toggle: undefined as never,
    } as AutoplayController<PlayingC>;
  }

  return {
    enabled: impl.enabled,
    isPlaying: impl.getIsPlaying(),
    setGate: impl.setGate,
    getGates: impl.getGates,
    play: impl.play,
    pause: impl.pause,
    toggle: impl.toggle,
  } as AutoplayController<PlayingC>;
}
