import type { CarouselAction } from "../../actions/action-types";
import { attachFocusPinGate } from "./focus-pin";

function getIndexFromTarget(target: EventTarget | null): number | null {
  if (!(target instanceof HTMLElement)) return null;
  const el = target.closest("[data-carousel-slide-index]");
  if (!el) return null;
  const raw = el.getAttribute("data-carousel-slide-index");
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? Math.trunc(value) : null;
}

describe("attachFocusPinGate", () => {
  it("pins on focusin and unpins on focusout", () => {
    const root = document.createElement("div");
    const slide = document.createElement("div");
    slide.setAttribute("data-carousel-slide-index", "2");
    root.appendChild(slide);

    const dispatch = jest.fn<void, [CarouselAction]>();
    const detach = attachFocusPinGate({
      root,
      dispatch,
      slideIndexFromTarget: getIndexFromTarget,
    });

    slide.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: "GATE/SET" }),
    );
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: "VIRTUAL/PIN" }),
    );

    slide.dispatchEvent(
      new FocusEvent("focusout", {
        bubbles: true,
        relatedTarget: document.body,
      }),
    );

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: "VIRTUAL/UNPIN" }),
    );
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: "GATE/SET" }),
    );

    detach();
  });

  it("does not unpin when focus stays within the same slide", () => {
    const root = document.createElement("div");
    const slide = document.createElement("div");
    const inner = document.createElement("button");
    slide.setAttribute("data-carousel-slide-index", "1");
    slide.appendChild(inner);
    root.appendChild(slide);

    const dispatch = jest.fn<void, [CarouselAction]>();
    const detach = attachFocusPinGate({
      root,
      dispatch,
      slideIndexFromTarget: getIndexFromTarget,
    });

    slide.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    inner.dispatchEvent(
      new FocusEvent("focusout", {
        bubbles: true,
        relatedTarget: slide,
      }),
    );

    expect(dispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: "VIRTUAL/UNPIN" }),
    );

    detach();
  });
});