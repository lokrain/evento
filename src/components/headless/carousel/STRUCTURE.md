# Folder Tree & Public Exports

This document defines the **exact folder structure** and the **public export surface**. Anything not explicitly exported is internal by contract.

---

## Folder Tree

```
@/components/headless/carousel/
  index.ts                       # ONLY public exports
  README.md                      # Canonical contract
  use-carousel.tsx               # Orchestrator: returns { engine, bindings }

  actions/                       # Action builders + validation
    action-types.ts
    action-validate.ts
    builders/

  a11y/                          # ARIA + announce helpers
    announce/
    aria/

  bindings/                      # DOM prop builders
    controls.ts
    root.ts
    slide.ts
    track.ts
    viewport.ts

  core/                          # brands/constants/types
    brands.ts
    clamp.ts
    constants.ts
    invariant.ts
    types.ts

  dom/                           # DOM listeners + refs + gates
    gates/
    io/
    listeners/
    refs/

  math/                          # Fenwick + numeric helpers
    fenwick/

  measure/                       # Resize observers + measurement queue
    anchor-lock.ts
    flush-measure.ts
    slide-observer.ts
    viewport-observer.ts

  model/                         # Pure services (autoplay, settle, snap, virtual)
    autoplay/
    settle/
    snap/
    virtual/

  store/                         # State + reducer + selectors
    state.ts
    reducer.ts
    reduce/
    selectors/
```

---

## Public Exports (`index.ts`)

```ts
// Hook
export { useCarousel } from "./use-carousel";

// Public types
export type {
  UseCarouselOptions,
  CarouselReturn,
  CarouselEngine,
  CarouselBindings,
  CarouselApi,

  Axis,
  ReadingDirection,
  SnapTarget,
  LiveRegionPoliteness,

  CommitThreshold,
  AutoplayGate,

  Controllable,
  Controlled,
  Uncontrolled,

  CapabilityOf,
  IndexCapabilityOf,
  PlayingCapabilityOf,
  ReadonlyCapability,
  WritableCapability,
  ReadonlyIndex,
  WritableIndex,
} from "./core/types";
```

---

## Export Rules (Non-Negotiable)

- `index.ts` must never export internals.
- `actions/`, `dom/`, `model/`, `measure/`, `store/` are engine-private.
- Public API changes require updating README first.
