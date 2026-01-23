import type { AutoplayGatesResult } from "./gates";

export type AutoplayLiveMode = "off" | "polite" | "assertive";

export interface AutoplayPolicyPlan {
  /**
   * Whether ticker should be running.
   */
  readonly shouldRun: boolean;

  /**
   * While autoplay is rotating, aria-live should be off to avoid spam.
   * When not rotating, restore to "polite" (or caller’s preferred baseline).
   */
  readonly desiredLiveMode: AutoplayLiveMode;

  /**
   * While autoplay is rotating, announcements should be suppressed.
   * Caller may still store lastAnnouncement; live region won't speak it.
   */
  readonly suppressAnnouncements: boolean;
}

/**
 * Autoplay policy is boundary-driven:
 * - uses gate output
 * - defines a11y behavior while autoplay runs
 *
 * Pure function. No timers. No dispatch. No DOM.
 */
export function computeAutoplayPolicy(input: {
  readonly gates: AutoplayGatesResult;

  /**
   * Whether the user/system wants announcements in general.
   * Autoplay will suppress while running.
   */
  readonly announceEnabled: boolean;

  /**
   * Baseline live mode when autoplay is NOT running.
   * Default is "polite".
   */
  readonly baselineLiveMode?: AutoplayLiveMode;
}): AutoplayPolicyPlan {
  const baseline = input.baselineLiveMode ?? "polite";

  if (!input.gates.canRun) {
    return {
      shouldRun: false,
      desiredLiveMode: baseline,
      suppressAnnouncements: false,
    };
  }

  // While rotating: never spam announcements or live region.
  return {
    shouldRun: true,
    desiredLiveMode: "off",
    suppressAnnouncements: true,
  };
}
