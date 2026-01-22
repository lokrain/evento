# Carousel Backlog

## Workflow
- Status icons: ✅ done, 🔄 in progress, ⏳ to do, 📌 parked/blocked
- Any task with complexity > 3 must be split into smaller, independently meaningful parts
- Favor small estimates (1–3). If larger, split by domain (engine/bindings/tests) or concern (runtime vs typing)
- Status rollup: Story is ⏳ if all tasks ⏳; 🔄 if any task 🔄; ✅ if all tasks ✅. Epic follows its stories (⏳ if any story ⏳, 🔄 if any story 🔄, ✅ when all stories ✅). When an epic is ✅, leave the epic note, but remove its stories/tasks to save space.
- Capture improvements: Any issue/idea noticed—regardless of current focus—must be logged here (Parking Lot or new Task) so nothing is lost.
- Commitment: We iterate until all backlog items for this component are completed and closed.
- Priority rule: If a task is started (🔄), it is the first thing to work on unless blocked. If blocked, mark it 📌 and note the reason.

## Epics

### Epic: Runtime & Options (Owner: TBD) ⏳  
Value: Unblocks all downstream work by delivering a normalized config, live engine state, and callable navigation APIs.

- Story: Engine wiring ⏳  
  Value: Enables core orchestrator to hold state/refs and expose navigation commands.
  - Task: Implement options normalization to internal config (C:2) ✅
  - Task: Wire core engine state/refs and navigation commands (C:3) 🔄
  - Task: Ensure pagination derives from engine index (no separate pagination state) (C:2) ✅

- Story: Defaults & validation ⏳  
  Value: Prevents invalid usage and guarantees predictable behavior out-of-the-box.
  - Task: Define safe defaults for layout/loop/interaction/motion/autoplay/accessibility (C:2) ✅
  - Task: Validate required fields (slideCount > 0) and guard invalid combos (C:2) ✅
  - Task: Enforce single transform writer invariant in config (no duplicate writers) (C:2) ⏳

### Epic: Autoplay & Gates (Owner: TBD)
- Story: Autoplay runtime
  - Task: Implement autoplay state (play/pause/toggle) and timers (C:3) ⏳
  - Task: Apply gates evaluation in runtime; honor reduced-motion and readonly index (C:3 → split if needed) ⏳
  - Task: Add unit/integration tests for runtime autoplay behavior (C:2) ⏳
- Story: Gate plumbing
  - Task: Wire hover/focusWithin/dragging/visibilityHidden/reducedMotion/manual gates into bindings/hooks (C:2) ⏳
  - Task: Expose gate state for debugging/telemetry (C:1) ⏳
  - Task: Ensure autoplay inactive when slideCount ≤ 1 (in runtime) (C:1) ✅

### Epic: Motion & Interaction (Owner: TBD)
- Story: Motion writer
  - Task: Implement track transform/transition writer and transitionend handling (C:3) 🔄
  - Task: Enforce single transform writer invariant in runtime (no competing writers) (C:2) ⏳
- Story: Input mapping
  - Task: Wire keyboard navigation with readonly guards (C:2) ⏳
  - Task: Implement pointer drag thresholds/fling with readonly snap-back (C:3) ⏳
- Story: Snap & loop ✅
  - Task: Implement snap-target resolution and loop band normalization (C:2) ✅
  - Task: Add unit tests for snap/loop math (C:2) ✅
  - Task: Implement commit threshold resolver (px/viewport/slide/snap) (C:2) ✅

### Epic: A11y & Bindings (Owner: TBD)
- Story: Roles & labels ✅
  - Task: Ensure bindings set roles/labels and disabled states (readonly/reduced-motion) (C:2) ✅
  - Task: Ensure icon-only controls (if any) get aria-label; avoid aria-roledescription on controls (C:1) ✅
- Story: Announcer
  - Task: Emit announcer messages on settle; wire live region politeness (C:2) ⏳
- Story: A11y tests
  - Task: Add a11y integration tests (announcer text, disabled controls) (C:2) ⏳
- Story: RTL & focus
  - Task: Verify RTL keyboard mapping and pagination semantics (C:2) ⏳
  - Task: Ensure focus-visible styling guidance and focusWithin handling in bindings (C:2) ⏳
  - Task: Honor prefers-reduced-motion in bindings (disable autoplay toggle, disable transitions) (C:2) 🔄

### Epic: Types & API (Owner: TBD)
- Story: Public types ⏳
  - Task: Extend binding prop types to accept data-* and common ARIA attributes (C:2) ✅
  - Task: Remove remaining `any` in tests by using typed helpers (C:1) ⏳
- Story: Capability contracts
  - Task: Keep capability typing in sync with INVARIANTS; update tsd tests when API shifts (C:2) ⏳
  - Task: Add type-level pagination derivation (pageIndex mirrors engine index) to tsd where relevant (C:2) ⏳

### Epic: Testing & Quality (Owner: TBD)
- Story: Coverage
  - Task: Add hook integration tests for drag/keyboard/motion (C:3 → split if large) ⏳
  - Task: Expand unit tests for options normalization defaults/validation (C:2) ⏳
  - Task: Add unit tests for thresholds resolver (C:2) ✅
  - Task: Add unit tests for transform/transition helpers (C:1) ✅
- Story: CI wiring
  - Task: Ensure test:types and test:unit run in CI; add integration job once engine is implemented (C:2) ⏳
  - Task: Add invariant coverage map linking tests to INVARIANTS.md (C:1) ⏳

### Epic: Hygiene (Owner: TBD)
- Story: Repo hygiene
  - Task: Ensure legacy `old/` and app files stay excluded from typecheck/tests until API parity (C:1) ✅
  - Task: Add lint/check to prevent camelCase files in carousel subtree (C:1) ⏳

## Parking Lot
- 📌 None currently
