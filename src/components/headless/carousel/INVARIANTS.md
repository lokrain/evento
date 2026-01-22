# Invariant Test Matrix

This document defines the **required invariants** and the corresponding **test matrix** that proves the engine’s guarantees.

This version incorporates **max strictness everywhere**, including capability-typed autoplay controls.

---

## 0. Type-Level Capability Invariants (Required)

These are compile-time contracts. They must be validated with `tsd` (or equivalent) in CI.

T0. `UseCarouselReturn` MUST expose a capability-typed control surface.

T1. If `autoplay.enabled === false`, then:

- `controls.autoplay.play` MUST be `never`
- `controls.autoplay.pause` MUST be `never`
- `controls.autoplay.toggle` MUST be `never`

T2. If `autoplay.enabled === true` but `slideCount <= 1`, then:

- `controls.autoplay.*` MUST be `never` (autoplay is not allowed when no meaningful movement exists).

T3. If `indexControl` is `controlled`, then:

- Internal writes MUST be disallowed at type level unless routed through `onIndexChange`.

T4. Readonly mode MUST remove all mutating commands (e.g. `next`, `prev`, `goTo`, autoplay commands).

---

## A. Core State & Determinism Invariants

A1. Deterministic state transitions: given the same event stream, the engine produces identical state.

A2. `renderIndex` drift is impossible: `renderIndex` MUST always map to a valid `realIndex` via `getRealIndexForRenderIndex`.

A3. “Settle” is a single canonical event: any motion/drag/scroll results in exactly one settle completion.

A4. `realIndex` MUST always be in `[0, slideCount-1]` when `slideCount > 0`.

A5. With `slideCount === 0`, the engine MUST be inert and safe (no throws, no timers, no announcements).

---

## B. Navigation Invariants

B1. `next()` advances by `slidesToScroll` respecting `continuous` and boundaries.

B2. `prev()` decreases by `slidesToScroll` respecting `continuous` and boundaries.

B3. `goTo(i)` clamps or wraps as configured; it MUST never produce out-of-range `realIndex`.

B4. In RTL (`dir="rtl"`) + axis `"x"`, navigation direction MUST remain intuitive and consistent.

---

## C. Drag/Pointer Invariants

C1. Drag gating: when `draggable=false`, pointer events MUST NOT mutate index or motion.

C2. Drag start engages drag gate immediately (affects autoplay gating).

C3. Drag end MUST settle deterministically to nearest snap (per threshold model).

C4. Drag MUST never cause index jumps larger than allowed by the snap model.

---

## D. Keyboard Invariants

D1. Root receives keyboard handler; arrow keys navigate based on axis and dir.

D2. Home/End (when supported) go to first/last slide deterministically.

D3. PageUp/PageDown (optional) MUST be either implemented consistently or explicitly unsupported (no partial behavior).

D4. Keyboard interaction MUST NOT trigger autoplay state changes except via explicit user autoplay controls.

---

## E. Autoplay Invariants

E1. Autoplay is allowed iff:

- `autoplay.enabled === true`
- `slideCount > 1`
- No active gates (see below)

E2. Gates pause autoplay immediately without mutating “user intent” play state:

- hover gate
- focusWithin gate
- dragging gate
- visibilityHidden gate
- reducedMotion gate
- manualPaused gate (user pressed pause)

E3. Multiple gates MUST produce a deterministic sorted reason list.

E4. When gates clear, autoplay resumes only if:

- autoplay remains enabled
- user did not manually pause (manualPaused gate inactive)
- slideCount still > 1

E5. Timers MUST be canceled on pause and visibility hidden; no background drift.

E6. In reduced motion, autoplay MUST NOT advance slides (even if “playing” is true as intent).

---

## F. Reduced Motion Invariants

F1. Reduced motion preference MUST be read from platform and treated as a gate.

F2. Reduced motion disables motion-based transitions and autoplay advances; index changes may still occur only via explicit user navigation.

---

## G. Accessibility Invariants

These invariants define the **minimum conformance contract** for an accessible carousel surface.
They are intended to align with WAI-ARIA Authoring Practices (Carousel) and support WCAG 2.2 AA
outcomes relevant to carousels (notably pause/stop/hide for autorotation).

> Terminology:
> - “Bindings” refers to the DOM/React (or other UI) layer that applies roles/attributes and renders controls.
> - “Engine” refers to the headless state machine and controllers.

### G1. Carousel root semantics (name + role)

- The carousel root **MUST** have an accessible name via **one** of:
  - `aria-label`, or
  - `aria-labelledby`.
- The carousel root **MUST** expose a stable role suitable for a named container:
  - preferred: `role="region"` (landmark) when an accessible name is provided, or
  - `role="group"` when a landmark is not desired but grouping semantics are required.
- If `aria-roledescription` is used on the root, it **MUST** be:
  - non-empty,
  - localized to page language, and
  - not used to replace required roles.

**Test requirements**
- Unit: prop-getters produce required attributes when `ariaLabel` / `ariaLabelledBy` is provided.
- Type: ensure root naming is required by config in bindings.
- Integration: root is discoverable by name in AT tree (via accessibility snapshot).

### G2. Slide semantics (group + name)

- Each slide container **MUST** be a grouping element with:
  - `role="group"`.
- Each slide **MUST** have an accessible name via **one** of:
  - `aria-label`, or
  - `aria-labelledby`.
- Recommended default naming is: `Slide {n} of {N}` (1-indexed).

**Test requirements**
- Unit: slide prop-getters emit role and label.
- Integration: each rendered slide has a unique accessible name.

### G3. `aria-roledescription` policy (root and slides)

- If `aria-roledescription` is emitted:
  - slides may use `aria-roledescription="slide"`;
  - root may use `aria-roledescription="carousel"`.
- `aria-roledescription` **MUST NOT** be used on interactive controls (buttons, links, inputs).
- Values **MUST** be localizable and **MUST** reflect the document language.

**Test requirements**
- Unit: roledescription is present only where allowed (root/slide containers).
- Snapshot: roledescription strings are configurable (no hard-coded English in core).

### G4. Autorotation control (pause/stop/hide)

If the carousel supports autorotation that can move content without user action:

- The UI **MUST** provide an explicit control to pause/stop autorotation.
- The pause state **MUST** be reflected to assistive tech (e.g., pressed/toggled state, or label change).
- When paused by the user, autorotation **MUST NOT** resume automatically unless the user re-enables it.

**Test requirements**
- Integration: pause control exists when autoplay is enabled and slideCount > 1.
- Behavioral: toggling pause prevents further autoplay advances.

### G5. Autorotation interruption (focus and hover)

- When keyboard focus enters the carousel region (including controls), autorotation **MUST** be paused via a gate.
- When pointer hover is over the carousel region (when hover is supported by the platform), autorotation **MUST** be paused via a gate.
- Autorotation may resume only when **all** pause gates are inactive and autoplay remains enabled.

**Test requirements**
- Behavioral: focusWithin gate engages immediately and is deterministic.
- Behavioral: hover gate engages immediately (when enabled).

### G6. Announcements (live region)

If announcements are enabled:

- Announcements **MUST** occur on **settle** only (never on intermediate drag/motion frames).
- Announcements **MUST** express slide position, at minimum: `Slide {n} of {N}`.
- The configured politeness (`polite` or `assertive`) **MUST** be respected.

**Test requirements**
- Unit: announcer is invoked only on settle events.
- Behavioral: settle emits exactly one announcement per settle transition.

### G7. Disabled control semantics

When next/prev/dot controls are disabled (e.g., not allowed at bounds in non-continuous mode):

- Native button controls **MUST** use `disabled`.
- Non-native interactive elements (if any) **MUST** use `aria-disabled="true"` and prevent activation.
- Disabled controls **MUST** remain perceivable and consistent for AT users (no “fake disabled” behavior).

**Test requirements**
- Unit: prop-getters set correct disabled semantics based on `canNext`/`canPrev`/etc.
- Integration: disabled controls do not trigger index changes.

### G8. No invalid ARIA (strict validity)

- Bindings **MUST NOT** emit ARIA roles, states, or properties that are invalid for the element/role combination.
- “Unknown attribute indexing” in tests (e.g., `props["data-axis"]`) **MUST** be solved by correct typing
  (data attributes allowed) rather than `any` casts.

**Test requirements**
- Integration: run an ARIA validity checker in CI against the reference bindings harness.
- Type: data-* attributes are typed in prop-getters return types so tests can read them without `any`.

---

## H. Measurement & Layout Invariants

H1. Measurement is stable: remeasure produces the same snaps when layout is unchanged.

H2. Resize observer (if enabled) triggers remeasure without causing index drift.

H3. Each slide may have different sizes; snapping must still be correct.

---

## I. Performance & Safety Invariants

I1. No timers when autoplay disabled or gates active.

I2. No unbounded allocations on pointer move.

I3. All invariants MUST be provable via unit/integration tests and type tests.

---
