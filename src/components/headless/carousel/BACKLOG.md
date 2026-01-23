# Headless Carousel Backlog

## Workflow
- Status icons: ✅ done, 🔄 in progress, ⏳ to do, 📌 blocked.
- Complexity (C) scale is 1–3 per task. Break any item that needs more than C:3 into smaller tasks.
- AI agents must always pick the highest-priority ⏳ task, update its status when starting/completing, and leave a short note when blocking or finishing work.

## Statuses (Jira-style)
- Backlog: Not yet prioritized or missing prerequisites.
- Ready: Clearly specified; can be executed without further questions.
- In Progress: Being implemented now.
- In Review: Code complete; awaiting review (lint/tests/a11y checks) and potential adjustments.
- Blocked: Waiting on prerequisite decision, file, or dependency.
- Done: Meets acceptance criteria and Definition of Done.

## Definition of Done (DoD)
- TypeScript strict passes.
- Biome lint passes (no disables).
- Jest unit tests pass.
- Playwright e2e (where applicable) pass.
- No unused exports/imports.
- No non-null assertions.
- No hot-path regressions: scroll handler remains ref-write only.
- A11y: ARIA props are traceable, deterministic, and test-covered.

## Epics

### Epic: Architecture & Repository Hygiene (Owner: @platform)
**Status: Done**
- Story: Lock folder structure and barrel exports (C:3)
  - Task: Create top-level barrel exports for bindings, a11y, actions/builders, model/autoplay, model/settle, model/virtual. (C:2) ✅ (no behavior change)
  - Task: Ensure existing imports can be swapped to barrels without cycles (document any exceptions). (C:2) ✅ (documented in README)
  - Task: Add repo-local carousel conventions to README (architecture boundaries, layer rules). (C:2) ✅
- Story: Enforce no-unused policy (C:2)
  - Task: Verify Biome/TS configuration fails on unused imports without ignore flags. (C:2) ✅ (Biome noUnusedImports/noUnusedVariables are error)

### Epic: Public Surface & Types (Owner: @headless-carousel)
**Status: Done**
- Story: Canonical public contract (C:2)
  - Task: Document `UseCarouselOptions`, `CarouselEngine`, `CarouselBindings`, and `CarouselReturn` in `core/types.ts` so they mirror the old `engine/types-public.ts` API surface. (C:2) ✅
  - Task: Export the new API from `index.ts` (hook + types). (C:1) ✅
  - Task: Update `use-carousel.tsx` to use the generic public types from `core/types.ts`. (C:2) ✅
  - Task: Add `CapabilityOf`, `IndexCapabilityOf`, `PlayingCapabilityOf`, and autoplay gate helpers so tsd tests can pin the behavior later. (C:2) ✅ (coverage via tsd task)
  - Task: Add typed `DataAttributes` support to binding prop helpers so consumers can pass `data-*` safely. (C:2) ✅ (coverage via bindings tests task)
  - Task: Define a `CarouselApi` type and ensure it is documented with read-only vs writable capabilities. (C:2) ✅ (coverage via tsd task)
  - Task: Align `use-carousel.tsx` local option/api typings with `core/types.ts` to avoid drift. (C:2) ✅
  - Task: Decide on public options adapter (normalize legacy options vs migrate callers) and document the approach. (C:2) ✅ (migrated callers)
  - Task: Update app call sites (`hero-carousels.tsx`, test carousel page) to the final public options shape. (C:3) ✅

### Epic: State Machine & Store Plumbing (Owner: @state)
**Status: Done**
- Story: Normalized runtime state (C:2)
  - Task: Implement `createInitialState` defaults in `store/state.ts` (loop, axis, autoplay, gating). (C:2) ✅ (covered by store/state tests)
  - Task: Wire reducers into `store/reducer.ts`, delegating to per-domain reducers (measure, navigation, motion, virtual, autoplay, a11y). (C:2) ✅ (covered by reducer tests)
  - Task: Add selectors (`select-index`, `select-can-nav`, `select-gates`, `select-window`, `select-a11y`) to read derived state. (C:2) ✅ (covered by selector tests)
  - Task: Extend `CarouselGatesState` with `dragging` and align reducers/actions to set it. (C:2) ✅ (covered by reducer gate test)
  - Task: Add a lightweight store facade to reduce `use-carousel.tsx` size (extract dispatch helpers + selectors). (C:3) ✅ (store/facade.ts)

### Epic: Actions & Validation (Owner: @actions)
**Status: Done**
- Story: Safe action builders (C:2)
  - Task: Ensure `action-validate.ts` provides reusable helpers (`toNonNegInt`, `toNonNegPx`, `mustBeBoolean`, `mustBeStringOrNull`). (C:1) ✅ (covered by action-validate tests)
  - Task: Implement builders for navigation, motion, virtual, measure, autoplay, and a11y actions, each mapping input to typed payloads via validators. (C:3) ✅ (covered by builders tests)
  - Task: Add unit tests (tsd/Jest) later once runtime exists (placeholder for future story). (C:1) ✅ (builder + validator tests)
  - Task: Add action-level invariants in tests to ensure invalid input throws (e.g., negative indices). (C:2) ✅

### Epic: DOM Bindings & Listeners (Owner: @bindings)
**Status: Done**
- Story: Minimal prop getters (C:2)
  - Task: Implement `bindings/*` helpers (root, viewport, track, slide, controls) that return sanitized props (roles, data attributes). (C:2) ✅ (coverage via bindings tests task)
  - Task: Flesh out DOM utilities (refs, scroll handler, mergeRefs) so listeners can hook into tracked elements. (C:2) ✅
  - Task: Supply placeholder listeners (on-scroll, on-pointer, on-keydown) that simply forward events to the store once wiring exists. (C:2) ✅ (pointer gate handler test)
  - Task: Add hover/focus/visibility gate listeners that toggle autoplay gates and clean up on unmount. (C:3) ✅ (hover/visibility tests)
  - Task: Implement pointer drag tracking and dispatch `dragging` gate transitions. (C:3) ✅ (dragging gate wired)
  - Task: Expand pointer drag tracking to include velocity/threshold handling (beyond gate toggling). (C:3) ✅ (pointer drag tracker test)
  - Task: Update `scroll-read.ts` to support axis selection or delete if unused. (C:1) ✅
  - Task: Ensure keyboard listeners are registered as `passive: true` only when safe, otherwise keep default to allow preventDefault. (C:2) ✅
  - Task: Add `aria-controls` wiring so controls reference the viewport id. (C:1) ✅ (wired in bindings + use-carousel)

### Epic: Model, Measurement & Virtualization (Owner: @model)
**Status: Done**
- Story: Virtual window + settle policies (C:3)
  - Task: Complete virtualization helpers (`compute-window`, `loop-keys`, `focus-pin`) and tie them to `store/virtual`. (C:3) ✅ (virtual window + slots tests)
  - Task: Add measurement helpers (anchor-lock, flush queue, observers) that will later feed the model. (C:2) ✅ (measure helper tests)
  - Task: Keep pure services (`settle-machine`, `settle-raf`, `settle-scrollend`, `snap` utilities) tested via placeholder tests so coverage exists once implemented. (C:2) ✅ (settle + snap tests)
  - Task: Add unit tests for settle-machine boundaries (scrollend vs stability sampling). (C:2) ✅
  - Task: Add unit tests for `compute-virtual-window` seam bucket + pinned behavior. (C:2) ✅
  - Task: Provide a deterministic `scrollend` fallback for browsers without native support. (C:2) ✅ (scrollend fallback test)
  - Task: Add snap helpers for align modes (`start`, `center`, `end`) and document expected offsets. (C:3) ✅ (snap helper tests)
  - Task: Add unit tests for settle RAF sampler idempotence and scrollend subscription lifecycle. (C:2) ✅
  - Task: Add focus pin gate tests for focus-in/out behavior. (C:2) ✅
  - Task: Define snap model API contracts in docs (slide/viewport alignment). (C:2) ✅ (README snap alignment)

### Epic: Accessibility & Autoplay Gate Policy (Owner: @a11y)
**Status: Done**
- Story: Policy-first handling (C:3)
  - Task: Formalize `model/autoplay` gate + policy helpers and ensure gate state is stored/reduced. (C:2) ✅ (covered by autoplay model tests)
  - Task: Align gate naming across `CarouselGatesState`, `AutoplayGate`, and DOM gate setters (e.g., `manual` vs `manualPause`, add missing `dragging`). (C:2) ✅
  - Task: Build `a11y/announce` helpers (format, policy) and reducers to control live region text/announce flag. (C:2) ✅ (covered by announce tests)
  - Task: Provide bindings hooking announcer props (aria-live, role) so future UI can render announcements. (C:2) ✅ (live-region props test)
  - Task: Add reduced-motion gate wiring (media query listener -> `gates.reducedMotion`). (C:2) ✅ (reduced-motion gate test)
  - Task: Add `aria-roledescription` policy toggle in bindings for consumers who disable it. (C:2) ✅ (aria roledescription tests)
  - Task: Add edge announcements (start/end) when loop disabled. (C:2) ✅ (edge announcement test)
  - Task: Wire announcements on settle commit (policy gates + A11Y/ANNOUNCE). (C:3) ✅ (policy helper test)
  - Task: Add stable a11y ids helper and wire into bindings (viewport, controls, live region). (C:3) ✅ (ids test)

### Epic: A11y Aria Props (Owner: @a11y)
**Status: Done**
- Story: ARIA prop builders (C:3) ✅
  - Task: Implement `a11y/aria/root-props.ts`. (C:2) ✅
  - Task: Implement `a11y/aria/slide-props.ts` and ensure data-carousel-slide-index is set. (C:2) ✅
  - Task: Implement `a11y/aria/control-props.ts` (aria-controls + disabled semantics). (C:2) ✅
  - Task: Implement `a11y/aria/live-region-props.ts` and delegate bindings to these helpers. (C:3) ✅

### Epic: Testing, Guardrails & Documentation (Owner: @qa)
**Status: Done**
- Story: Verify capability typing (C:2)
  - Task: Restore tsd tests ensuring index/autoplay capabilities map to navigation/play controls. (C:3) ✅ (index.test-d.ts)
  - Task: Reintroduce Jest helpers (e.g., DOM utilities) for future integration tests once hook is wired. (C:2) ✅ (testing/dom.ts)
  - Task: Add unit tests for bindings outputs (root/slide/controls/viewport). (C:2) ✅
  - Task: Document invariants (STRUCTURE/INVARIANTS) updates referencing new layout so contributors know expected behavior. (C:2) ✅
  - Task: Update `STRUCTURE.md` to reflect the current folder tree (`core/`, `store/`, `dom/`, `actions/`, `bindings/`, `model/`, `measure/`, `math/`). (C:2) ✅
  - Task: Refresh README architecture section to match the new domain layout and remove references to removed folders. (C:2) ✅
  - Task: Add integration tests for keyboard + button navigation in loop/non-loop modes. (C:3) ✅ (use-carousel.navigation.test.tsx)
  - Task: Add regression tests for autoplay gating combinations (manualPause + hover + hidden). (C:3) ✅ (autoplay gates test)

## AI Workflow
- Always consult this backlog before editing: pick the highest-priority ⏳ task, set it to 🔄, and make a short note (e.g., in PR/commit) about progress.
- Keep each change scoped to one task. If you realize a task needs splitting (C > 3), break it down and update the backlog before coding.
- When a task is blocked, mark it 📌 with the blocker note; when complete, mark ✅ and note any follow-up needed.
- Use this backlog as the single source of truth for feature status; do not bypass it with ad-hoc TODOs.
- Important note: do not immediately fix errors—first understand what caused them, figure out the correct solution, then apply the fix. Racing to patch without comprehension is discouraged.
- Testing policy: aim for full coverage. Prefer behavior/integration tests first, then unit tests. Every completed task should include corresponding tests unless explicitly noted.