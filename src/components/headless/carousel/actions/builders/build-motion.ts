import type { CarouselAction } from "../action-types";
import { mustBeBoolean, toNonNegInt } from "../action-validate";

export function buildMotionStart(params: {
  readonly isAnimating: unknown;
  readonly reason: "nav" | "drag" | "measure" | "external";
}): CarouselAction {
  const anim = mustBeBoolean(params.isAnimating, "isAnimating");
  return {
    type: "MOTION/START",
    payload: { isAnimating: anim, reason: params.reason },
  };
}

export function buildMotionSettlePending(token: unknown): CarouselAction {
  const t = toNonNegInt(token, "token");
  return {
    type: "MOTION/SETTLE_PENDING",
    payload: { token: t },
  };
}

export function buildMotionSettleCommit(token: unknown): CarouselAction {
  const t = toNonNegInt(token, "token");
  return {
    type: "MOTION/SETTLE_COMMIT",
    payload: { token: t },
  };
}

export function buildMotionClear(reason: "cancel" | "reset"): CarouselAction {
  return {
    type: "MOTION/CLEAR",
    payload: { reason },
  };
}
