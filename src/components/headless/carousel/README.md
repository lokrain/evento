# Carousel Engine

A **headless, strictly-typed, motion-aware carousel engine** for React.

This project is not a “carousel component”.
It is a **deterministic interaction engine** that manages layout, motion, interaction, automation, and accessibility, while leaving all rendering and styling to the consumer.

---

## Goals

* **Strict correctness**

  * One canonical index
  * One canonical position
  * No state drift
* **Type-level guarantees**

  * Controlled vs uncontrolled ownership is enforced at compile time
  * Read-only controlled state removes mutation commands entirely
* **Separation of concerns**

  * Engine (algorithm & state)
  * Bindings (DOM + ARIA)
  * Presentation (your components)
* **Human-readable API**

  * Names reflect user intent, not implementation
* **General-purpose**

  * App UI, marketing UI, accessibility-critical UI

---

## Non-Goals

* Styling, layout, or visuals
* Opinionated UI components
* CSS scroll-snap
* DOM mutation outside a single transform writer
* Implicit behavior based on undocumented defaults

---

## Mental Model

The carousel is modeled as:

1. A **virtual infinite track**
2. With a **single canonical offset** (`virtualOffsetPx`)
3. And a **single canonical real index** (`0 … slideCount-1`)

Everything else derives from these.

There is no concept of “current slide element”.
There is only:

* **position**
* **measurement**
* **intent**
* **motion**

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│              useCarousel                │  ← Orchestrator
│  (wires domains together, exposes API)  │
└───────────────┬─────────────────────────┘
                │
 ┌──────────────┼────────────────────────────────────────────┐
 │              │                                            │
 │          Engine Domains                                Bindings
 │                                                      (optional)
 │
 │  model/        → pure math (snap, loop, thresholds)
 │  measure/      → DOM read → SnapModel
 │  motion/       → DOM write (single writer)
 │  interaction/  → pointer + keyboard intent
 │  autoplay/     → automation + gating
 │  a11y/         → announcements only
 │  platform/     → reduced motion, visibility
 │
 └────────────────────────────────────────────────────────────┘
```

**Rule:** domains may not depend on each other cyclically.
Only the orchestrator composes them.

---

## Strict State Ownership (Core Principle)

Every mutable value is either:

* **Uncontrolled** (engine owns it)
* **Controlled** (external owner)
* **Controlled & read-only** (engine must not mutate)

This is enforced **at the type level**, not at runtime.

### Controllable State Contract

```ts
type Controlled<T> =
  | {
      mode: "controlled";
      value: T;
      onChange: (next: T) => void;
    }
  | {
      mode: "controlled";
      value: T;
      readonly: true;
      onChange?: never;
    };

 type Uncontrolled<T> = {
   mode: "uncontrolled";
   defaultValue?: T;
   onChange?: (next: T) => void;
 };

 export type Controllable<T> = Controlled<T> | Uncontrolled<T>;
```

### Why this matters

* Invalid combinations are impossible to express
* You cannot "forget" an `onChange` handler
* Read-only controlled state **removes mutation APIs at compile time**

---

## Engine vs Bindings

### Engine

The engine:

* Owns canonical state
* Runs algorithms
* Applies motion
* Makes decisions

It **does not**:

* Render UI
* Attach DOM event handlers directly
* Know about styling or layout

### Bindings

Bindings are a thin adapter layer that:

* Translate DOM events (hover, focus, click) into engine inputs
* Attach ARIA roles and attributes
* Expose ergonomic prop getters

Bindings contain **no business logic**.

---

## Autoplay Gating Model

Autoplay is governed by **explicit gates**, all owned by the engine:

```ts
 type AutoplayGate =
   | "hover"
   | "focusWithin"
   | "dragging"
   | "visibilityHidden"
   | "reducedMotion"
   | "manual";
```

Bindings and subsystems merely **report gate state**.
The autoplay controller decides whether playback is allowed.

This guarantees:

* No duplicated policy
* No race conditions
* Deterministic behavior

---

## Interaction Thresholds

User intent is interpreted via **explicit distance-based thresholds**.

```ts
 type CommitThreshold =
   | { kind: "px"; value: number }
   | { kind: "viewport"; value: number }
   | { kind: "slide"; value: number }
   | { kind: "snap"; value: number };
```

This avoids magic ratios and allows designers and engineers to reason in real units.

---

## Motion Model

Motion is defined separately from interaction:

* **Dwell time**: how long the carousel waits before moving
* **Transition duration**: how long the movement animation takes

Reduced-motion preferences disable transitions and autoplay automatically.

---

## Pagination Correctness

Pagination is a **pure projection** of engine state:

* `pageIndex` derives from `engine.index`
* Clicking pagination calls `engine.goTo(index)`

There is no separate pagination state.

---

## Guarantees

This engine guarantees:

* Single source of truth for index and position
* No visual/index drift
* No duplicated motion writers
* No implicit side effects
* Compile-time enforcement of ownership rules

---

## Intended Audience

This project is designed for:

* Design system authors
* UI infrastructure engineers
* Accessibility-conscious teams
* Applications that require correctness over convenience

If you want a drop-in carousel component, this is not that.

---

## Status

This README defines the **contract**.

Implementation must conform to this document.
Breaking changes require updating this document first.
