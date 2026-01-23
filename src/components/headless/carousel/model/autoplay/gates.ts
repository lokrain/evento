export type AutoplayBlockReason =
  | "disabled"
  | "slideCount"
  | "interval"
  | "manualPause"
  | "hover"
  | "focusWithin"
  | "dragging"
  | "hidden"
  | "reducedMotion";

export interface AutoplayGatesInput {
  readonly enabled: boolean;
  readonly intervalMs: number;
  readonly slideCount: number;

  readonly gates: {
    readonly manualPause: boolean;
    readonly hover: boolean;
    readonly focusWithin: boolean;
    readonly visibilityHidden: boolean;
    readonly dragging: boolean;
    readonly reducedMotion: boolean;
  };
}

export interface AutoplayGatesResult {
  readonly canRun: boolean;
  readonly blocked: ReadonlyArray<AutoplayBlockReason>;
}

/**
 * Compute whether autoplay may run "right now".
 *
 * Pure function, no timers, no DOM, no store access.
 */
export function computeAutoplayGates(input: AutoplayGatesInput): AutoplayGatesResult {
  const blocked: AutoplayBlockReason[] = [];

  if (!input.enabled) blocked.push("disabled");
  if (Math.max(0, Math.trunc(input.slideCount)) <= 1) blocked.push("slideCount");

  const interval = Math.trunc(input.intervalMs);
  if (!Number.isFinite(interval) || interval <= 0) blocked.push("interval");

  if (input.gates.manualPause) blocked.push("manualPause");
  if (input.gates.hover) blocked.push("hover");
  if (input.gates.focusWithin) blocked.push("focusWithin");
  if (input.gates.dragging) blocked.push("dragging");
  if (input.gates.visibilityHidden) blocked.push("hidden");
  if (input.gates.reducedMotion) blocked.push("reducedMotion");

  return {
    canRun: blocked.length === 0,
    blocked,
  };
}
