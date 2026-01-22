import type { CommitThreshold } from "../engine/types-public";

// Convert a CommitThreshold to pixels given current viewport/slide/snap distances.
// Fallback: snap 0.5 if insufficient data.
export function toPxThreshold(
  threshold: CommitThreshold | undefined,
  ctx: { viewportPx: number; slidePx: number; snapPx: number },
): number {
  const t = threshold ?? { kind: "snap", value: 0.5 };
  const { viewportPx, slidePx, snapPx } = ctx;

  switch (t.kind) {
    case "px":
      return t.value;
    case "viewport":
      return clampPositive(t.value * viewportPx);
    case "slide":
      return clampPositive(t.value * slidePx);
    case "snap":
    default:
      return clampPositive(t.value * snapPx);
  }
}

function clampPositive(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}