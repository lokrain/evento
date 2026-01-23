# Headless Carousel Backlog

## Workflow
- Status icons: ✅ done, 🔄 in progress, ⏳ to do, 📌 blocked.
- Complexity (C) scale is 1–3 per task. Break any item that needs more than C:3 into smaller tasks.
- AI agents must always pick the highest-priority ⏳ task, update its status when starting/completing, and leave a short note when blocking or finishing work.

## Epics

### Epic: Public Surface & Types (Owner: @headless-carousel)
**Status: ⏳**
- Story: Canonical public contract (C:2)
  - Task: Document `UseCarouselOptions`, `CarouselEngine`, `CarouselBindings`, and `CarouselReturn` in `core/types.ts` so they mirror the old `engine/types-public.ts` API surface. (C:2)
  - Task: Export the new API from `index.ts` (hook + types) and ensure `use-carousel.tsx` surface signatures leverage the new generics. (C:1)
  - Task: Add `CapabilityOf`, `IndexCapabilityOf`, `PlayingCapabilityOf`, and autoplay gate helpers so tsd tests can pin the behavior later. (C:2)

### Epic: State Machine & Store Plumbing (Owner: @state)
**Status: ⏳**
- Story: Normalized runtime state (C:2)
  - Task: Implement `createInitialState` defaults in `store/state.ts` (loop, axis, autoplay, gating). (C:2)
  - Task: Wire reducers into `store/reducer.ts`, delegating to per-domain reducers (measure, navigation, motion, virtual, autoplay, a11y). (C:2)
  - Task: Add selectors (`select-index`, `select-can-nav`, `select-gates`, `select-window`, `select-a11y`) to read derived state. (C:2)

### Epic: Actions & Validation (Owner: @actions)
**Status: ⏳**
- Story: Safe action builders (C:2)
  - Task: Ensure `action-validate.ts` provides reusable helpers (`toNonNegInt`, `toNonNegPx`, `mustBeBoolean`, `mustBeStringOrNull`). (C:1)
  - Task: Implement builders for navigation, motion, virtual, measure, autoplay, and a11y actions, each mapping input to typed payloads via validators. (C:3)
  - Task: Add unit tests (tsd/Jest) later once runtime exists (placeholder for future story). (C:1)

### Epic: DOM Bindings & Listeners (Owner: @bindings)
**Status: ⏳**
- Story: Minimal prop getters (C:2)
  - Task: Implement `bindings/*` helpers (root, viewport, track, slide, controls) that return sanitized props (roles, data attributes). (C:2)
  - Task: Flesh out DOM utilities (refs, scroll handler, mergeRefs) so listeners can hook into tracked elements. (C:2)
  - Task: Supply placeholder listeners (on-scroll, on-pointer, on-keydown) that simply forward events to the store once wiring exists. (C:2)

### Epic: Model, Measurement & Virtualization (Owner: @model)
**Status: ⏳**
- Story: Virtual window + settle policies (C:3)
  - Task: Complete virtualization helpers (`compute-window`, `loop-keys`, `focus-pin`) and tie them to `store/virtual`. (C:3)
  - Task: Add measurement helpers (anchor-lock, flush queue, observers) that will later feed the model. (C:2)
  - Task: Keep pure services (`settle-machine`, `settle-raf`, `settle-scrollend`, `snap` utilities) tested via placeholder tests so coverage exists once implemented. (C:2)

### Epic: Accessibility & Autoplay Gate Policy (Owner: @a11y)
**Status: ⏳**
- Story: Policy-first handling (C:3)
  - Task: Formalize `model/autoplay` gate + policy helpers and ensure gate state is stored/reduced. (C:2)
  - Task: Build `a11y/announce` helpers (format, policy) and reducers to control live region text/announce flag. (C:2)
  - Task: Provide bindings hooking announcer props (aria-live, role) so future UI can render announcements. (C:2)

### Epic: Testing, Guardrails & Documentation (Owner: @qa)
**Status: ⏳**
- Story: Verify capability typing (C:2)
  - Task: Restore tsd tests ensuring index/autoplay capabilities map to navigation/play controls. (C:3)
  - Task: Reintroduce Jest helpers (e.g., DOM utilities) for future integration tests once hook is wired. (C:2)
  - Task: Document invariants (STRUCTURE/INVARIANTS) updates referencing new layout so contributors know expected behavior. (C:2)

## AI Workflow
- Always consult this backlog before editing: pick the highest-priority ⏳ task, set it to 🔄, and make a short note (e.g., in PR/commit) about progress.
- Keep each change scoped to one task. If you realize a task needs splitting (C > 3), break it down and update the backlog before coding.
- When a task is blocked, mark it 📌 with the blocker note; when complete, mark ✅ and note any follow-up needed.
- Use this backlog as the single source of truth for feature status; do not bypass it with ad-hoc TODOs.
- Important note: do not immediately fix errors—first understand what caused them, figure out the correct solution, then apply the fix. Racing to patch without comprehension is discouraged.