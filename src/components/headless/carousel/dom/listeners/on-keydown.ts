import type { Axis, Dir } from "../../core/types";

/**
 * Keyboard navigation helper.
 * This is boundary-ish (keydown), not hot-path (scroll).
 */

export type KeyNavCommand = "prev" | "next";

export function keydownToCommand(params: {
  readonly e: KeyboardEvent;
  readonly axis: Axis;
  readonly dir: Dir;
}): KeyNavCommand | null {
  const { e, axis, dir } = params;

  // Respect common inputs; never steal keys from editable elements.
  const target = e.target;
  if (isEditableTarget(target)) return null;

  if (axis === "x") {
    if (e.key === "ArrowLeft") return dir === "rtl" ? "next" : "prev";
    if (e.key === "ArrowRight") return dir === "rtl" ? "prev" : "next";
    return null;
  }

  // axis === "y"
  if (e.key === "ArrowUp") return "prev";
  if (e.key === "ArrowDown") return "next";
  return null;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;

  // Also handle elements inside an editable parent.
  const editableParent = target.closest?.("[contenteditable=''],[contenteditable='true']");
  return Boolean(editableParent);
}
