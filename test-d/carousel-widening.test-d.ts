import { expectError, expectType } from "tsd";
import { useCarousel } from "../src/components/headless/carousel";
import type { Controllable, Controlled } from "../src/components/headless/carousel";

/**
 * Goal: prevent accidental widening (e.g., annotating as Controllable<number>)
 * from silently changing capability outcomes.
 *
 * Important: Conditional types distribute over unions. If you widen to the union
 * `Controllable<number>`, the safest result is typically "commands not callable"
 * because TS can no longer prove writability.
 */

// A precise readonly controllable, but then widened (bad consumer pattern)
const indexReadonlyPrecise = {
  mode: "controlled",
  value: 0,
  readonly: true,
} as const satisfies Controlled<number>;

// Widening step: loses the specific discriminant relationship for inference
const indexWidened: Controllable<number> = indexReadonlyPrecise;

{
  const { engine } = useCarousel({
    slideCount: 3,
    index: indexWidened,
  });

  // Widening loses readonly precision; commands degrade to never (no guarantee)
  expectType<never>(engine.next);
  expectType<never>(engine.prev);
  expectType<never>(engine.goTo);
}

// Same for autoplay.playing
const playingReadonlyPrecise = {
  mode: "controlled",
  value: false,
  readonly: true,
} as const satisfies Controlled<boolean>;

const playingWidened: Controllable<boolean> = playingReadonlyPrecise;

{
  const { engine } = useCarousel({
    slideCount: 3,
    autoplay: { enabled: true, playing: playingWidened },
  });

  expectType<never>(engine.autoplay.pause);
  expectType<never>(engine.autoplay.toggle);

  // Gate reporting must still exist
  engine.autoplay.setGate("manual", true);
  expectType<boolean>(engine.autoplay.getGates().manual);
}
