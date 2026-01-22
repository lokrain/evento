import { expectError, expectNever, expectType } from "tsd";
import { useCarousel } from "@/components/headless/carousel";
import type { Controlled, Uncontrolled } from "@/components/headless/carousel";

/**
 * Key rule for capability-typed APIs:
 * Use `as const satisfies ...` so TS retains the discriminant + readonly flags,
 * and generic inference in `useCarousel` stays precise.
 */

/* -------------------------------------------------------------------------------------------------
 * Controllables (precise, non-widened)
 * ------------------------------------------------------------------------------------------------- */

// Index
const indexWritable = {
  mode: "controlled",
  value: 0,
  onChange: (_next: number) => { },
} as const satisfies Controlled<number>;

const indexReadonly = {
  mode: "controlled",
  value: 0,
  readonly: true,
} as const satisfies Controlled<number>;

const indexUncontrolled = {
  mode: "uncontrolled",
  defaultValue: 0,
  onChange: (_next: number) => { },
} as const satisfies Uncontrolled<number>;

// Playing
const playingWritable = {
  mode: "controlled",
  value: true,
  onChange: (_next: boolean) => { },
} as const satisfies Controlled<boolean>;

const playingReadonly = {
  mode: "controlled",
  value: false,
  readonly: true,
} as const satisfies Controlled<boolean>;

const playingUncontrolled = {
  mode: "uncontrolled",
  defaultValue: true,
  onChange: (_next: boolean) => { },
} as const satisfies Uncontrolled<boolean>;

/* -------------------------------------------------------------------------------------------------
 * H.29–H.31 Index capability typing
 * ------------------------------------------------------------------------------------------------- */

{
  // H.29: readonly-controlled index removes mutation commands
  const { engine } = useCarousel<typeof indexReadonly, typeof playingUncontrolled>({
    slideCount: 3,
    index: indexReadonly,
  });

  expectNever(engine.next);
  expectNever(engine.prev);
  expectNever(engine.goTo);

  expectType<never>(engine.next);
  expectType<never>(engine.prev);
  expectType<never>(engine.goTo);

}

{
  // H.30: writable-controlled index exposes mutation commands
  const { engine } = useCarousel<typeof indexWritable, typeof playingUncontrolled>({
    slideCount: 3,
    index: indexWritable,
  });

  expectType<(opts?: { transitionDurationMs?: number }) => void>(engine.next);
  expectType<(opts?: { transitionDurationMs?: number }) => void>(engine.prev);
  expectType<(index: number, opts?: { transitionDurationMs?: number }) => void>(engine.goTo);
}

{
  // H.31: uncontrolled index exposes mutation commands
  const { engine } = useCarousel<typeof indexUncontrolled, typeof playingUncontrolled>({
    slideCount: 3,
    index: indexUncontrolled,
  });

  expectType<(opts?: { transitionDurationMs?: number }) => void>(engine.next);
  expectType<(opts?: { transitionDurationMs?: number }) => void>(engine.prev);
  expectType<(index: number, opts?: { transitionDurationMs?: number }) => void>(engine.goTo);
}

/* -------------------------------------------------------------------------------------------------
 * H.32–H.34 Autoplay playing capability typing (new)
 * ------------------------------------------------------------------------------------------------- */

{
  // H.32: readonly-controlled playing removes play/pause/toggle
  const { engine } = useCarousel<typeof indexUncontrolled, typeof playingReadonly>({
    slideCount: 3,
    autoplay: {
      enabled: true,
      playing: playingReadonly,
    },
  });

  expectNever(engine.autoplay.play);
  expectNever(engine.autoplay.pause);
  expectNever(engine.autoplay.toggle);

  // Gate reporting must always exist
  engine.autoplay.setGate("manual", true);
  const gates = engine.autoplay.getGates();
  expectType<Readonly<Record<string, boolean>>>(gates as Readonly<Record<string, boolean>>);
}

{
  // H.33: writable-controlled playing exposes play/pause/toggle
  const { engine } = useCarousel<typeof indexUncontrolled, typeof playingWritable>({
    slideCount: 3,
    autoplay: {
      enabled: true,
      playing: playingWritable,
    },
  });

  expectType<void>(engine.autoplay.play());
  expectType<void>(engine.autoplay.pause());
  expectType<void>(engine.autoplay.toggle());
}

{
  // H.34: uncontrolled playing exposes play/pause/toggle
  const { engine } = useCarousel<typeof indexUncontrolled, typeof playingUncontrolled>({
    slideCount: 3,
    autoplay: {
      enabled: true,
      playing: playingUncontrolled,
    },
  });

  expectType<void>(engine.autoplay.play());
  expectType<void>(engine.autoplay.pause());
  expectType<void>(engine.autoplay.toggle());
}
