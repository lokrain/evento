import { createInitialState } from "../state";
import { selectCanNav } from "./select-can-nav";
import { selectIndex } from "./select-index";
import { selectAutoplayEnabled, selectGates } from "./select-gates";
import { selectAnnounceEnabled } from "./select-a11y";

describe("store selectors", () => {
  it("returns derived navigation flags", () => {
    const state = createInitialState({
      axis: "x",
      dir: "ltr",
      loop: false,
      slideCount: 2,
      initialIndex: 0,
    });

    expect(selectCanNav(state)).toEqual({ canPrev: false, canNext: true });
  });

  it("returns index and gates", () => {
    const state = createInitialState({
      axis: "y",
      dir: "rtl",
      loop: true,
      slideCount: 3,
      initialIndex: 1,
    });

    expect(selectIndex(state)).toBe(1);
    expect(selectGates(state).manualPause).toBe(false);
    expect(selectAutoplayEnabled(state)).toBe(false);
    expect(selectAnnounceEnabled(state)).toBe(true);
  });
});