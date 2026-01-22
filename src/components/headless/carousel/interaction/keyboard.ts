// src/components/headless/carousel/interaction/keyboard.ts
import type { Axis, ReadingDirection } from "../engine/types-public";

export type KeyIntent =
  | { kind: "next" }
  | { kind: "prev" }
  | { kind: "goTo"; index: number }
  | { kind: "none" };

export function keyToIntent(args: {
  key: string;
  axis: Axis;
  readingDirection: ReadingDirection;
  slideCount: number;
}): KeyIntent {
  const { key, axis, readingDirection, slideCount } = args;

  if (key === "Home") return { kind: "goTo", index: 0 };
  if (key === "End") return { kind: "goTo", index: Math.max(0, slideCount - 1) };

  // Horizontal
  if (axis === "x") {
    if (key === "ArrowRight") return readingDirection === "rtl" ? { kind: "prev" } : { kind: "next" };
    if (key === "ArrowLeft") return readingDirection === "rtl" ? { kind: "next" } : { kind: "prev" };
    return { kind: "none" };
  }

  // Vertical
  if (key === "ArrowDown") return { kind: "next" };
  if (key === "ArrowUp") return { kind: "prev" };
  return { kind: "none" };
}
