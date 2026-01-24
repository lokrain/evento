// src/components/headless/carousel/store/reduce/reduce-virtual.ts

import type { CarouselAction } from "../../actions/action-types";
import type { CarouselState } from "../state";
import type { VirtualWindow } from "../../core/types";

function windowsEqual(a: VirtualWindow | null, b: VirtualWindow | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.start === b.start && a.end === b.end && a.size === b.size;
}

function cloneSetAdd(prev: ReadonlySet<number>, value: number): ReadonlySet<number> {
  if (prev.has(value)) return prev;
  const next = new Set(prev);
  next.add(value);
  return next;
}

function cloneSetDelete(prev: ReadonlySet<number>, value: number): ReadonlySet<number> {
  if (!prev.has(value)) return prev;
  const next = new Set(prev);
  next.delete(value);
  return next;
}

export function reduceVirtual(state: CarouselState, action: CarouselAction): CarouselState {
  switch (action.type) {
    case "VIRTUAL/SET_WINDOW": {
      const nextWindow = action.payload.window;
      if (windowsEqual(state.virtual.window, nextWindow)) return state;

      return {
        ...state,
        virtual: {
          ...state.virtual,
          window: nextWindow,
        },
      };
    }

    case "VIRTUAL/PIN": {
      const idx = Math.trunc(action.payload.index);
      const pinned = cloneSetAdd(state.virtual.pinned, idx);
      if (pinned === state.virtual.pinned) return state;

      return {
        ...state,
        virtual: {
          ...state.virtual,
          pinned,
        },
      };
    }

    case "VIRTUAL/UNPIN": {
      const idx = Math.trunc(action.payload.index);
      const pinned = cloneSetDelete(state.virtual.pinned, idx);
      if (pinned === state.virtual.pinned) return state;

      return {
        ...state,
        virtual: {
          ...state.virtual,
          pinned,
        },
      };
    }

    case "VIRTUAL/SET_EPOCH": {
      const epoch = Math.max(0, Math.trunc(action.payload.epoch));
      if (epoch === state.virtual.epoch) return state;

      return {
        ...state,
        virtual: {
          ...state.virtual,
          epoch,
        },
      };
    }

    default:
      return state;
  }
}
