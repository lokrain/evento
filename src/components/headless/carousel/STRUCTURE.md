# Folder Tree & Public Exports

This document defines the **exact folder structure** and the **public export surface**. Anything not explicitly exported is internal by contract.

---

## Folder Tree

```
@/components/headless/carousel/
  index.ts                       # ONLY public exports
  README.md                      # Canonical contract (see README canvas)

  engine/
    use-carousel.tsx             # Orchestrator: returns { engine, bindings }
    options.ts                   # Normalize public options -> internal config
    types-public.ts              # Public types (re-exported)
    types-internal.ts            # Internal engine-only types
    state.ts                     # Canonical React state/refs

  model/
    types.ts                     # SnapModel and pure math types
    index-math.ts                # mod / clamp / numeric guards
    loop.ts                      # banding + offset normalization
    snap-targets.ts              # nearest target resolution
    thresholds.ts                # CommitThreshold -> px resolver
    duration.ts                  # duration from distance/speed helpers

  measure/
    compute-model.ts             # Pure: DOMRects -> SnapModel
    use-measure-model.ts         # ResizeObserver + RAF scheduling
    refs.ts                      # ref registration helpers

  motion/
    compute-transform.ts         # offset + axis -> transform string
    compute-transition.ts        # duration + easing -> transition string
    use-track-transform.ts       # SINGLE DOM writer
    use-transition.ts            # transitionend -> normalize + settle

  interaction/
    keyboard.ts                  # pure key -> intent mapping
    use-pointer-drag.ts          # pointer capture + velocity + release intent
    focus-within.ts              # focus-within tracker
    types.ts

  autoplay/
    gates.ts                     # pure autoplay gate evaluation
    use-autoplay.ts              # timers + scheduling
    types.ts

  a11y/
    aria.ts                      # roles/labels helpers
    use-announcer.ts             # live region announcements
    types.ts

  platform/
    use-prefers-reduced-motion.ts
    visibility.ts

  bindings/
    use-carousel-bindings.ts     # default DOM bindings
    types.ts

  testing/
    fixtures.ts                  # fake rects, raf/timers
    harness.tsx                  # React test harness
```

---

## Public Exports (`index.ts`)

```ts
// Hook
export { useCarousel } from "./engine/use-carousel";

// Public types
export type {
  UseCarouselOptions,
  CarouselReturn,
  CarouselEngine,
  CarouselBindings,

  Axis,
  ReadingDirection,
  SnapTarget,
  LiveRegionPoliteness,

  CommitThreshold,
  AutoplayGate,

  Controllable,
  Controlled,
  Uncontrolled,

  CarouselCapabilities,
  WritableIndex,
  ReadonlyIndex,
} from "./engine/types-public";
```

### Optional advanced exports

If you want consumers to build **custom bindings**:

```ts
export { useCarouselBindings } from "./bindings/use-carousel-bindings";
export type { CarouselBindingsOptions } from "./bindings/types";
```

---

## Export Rules (Non-Negotiable)

* `index.ts` must never export internals
* `model/`, `motion/`, `measure/`, `interaction/`, `autoplay/` are engine-private
* Public API changes require updating README first
