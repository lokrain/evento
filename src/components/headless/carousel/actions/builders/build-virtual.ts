import type { CarouselAction } from "../action-types";
import type { VirtualWindow } from "../../core/types";
import { toNonNegInt } from "../action-validate";

export function buildVirtualSetWindow(window: VirtualWindow | null): CarouselAction {
  return {
    type: "VIRTUAL/SET_WINDOW",
    payload: { window },
  };
}

export function buildVirtualPin(index: unknown, reason: "focus" | "custom" = "custom"): CarouselAction {
  const idx = toNonNegInt(index, "index");
  return {
    type: "VIRTUAL/PIN",
    payload: { index: idx, reason },
  };
}

export function buildVirtualUnpin(index: unknown, reason: "focus" | "custom" = "custom"): CarouselAction {
  const idx = toNonNegInt(index, "index");
  return {
    type: "VIRTUAL/UNPIN",
    payload: { index: idx, reason },
  };
}

export function buildVirtualSetEpoch(epoch: unknown, reason: "loop-seam" | "reset"): CarouselAction {
  const e = toNonNegInt(epoch, "epoch");
  return {
    type: "VIRTUAL/SET_EPOCH",
    payload: { epoch: e, reason },
  };
}
