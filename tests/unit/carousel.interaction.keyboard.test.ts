import { keyToIntent } from "@/components/headless/carousel/interaction/keyboard";

describe("interaction/keyboard (pure)", () => {
  test("Invariant 13: arrow keys map correctly for axis + reading direction", () => {
    expect(keyToIntent({ key: "ArrowRight", axis: "x", readingDirection: "ltr", slideCount: 5 })).toEqual({ kind: "next" });
    expect(keyToIntent({ key: "ArrowLeft", axis: "x", readingDirection: "ltr", slideCount: 5 })).toEqual({ kind: "prev" });

    expect(keyToIntent({ key: "ArrowDown", axis: "y", readingDirection: "ltr", slideCount: 5 })).toEqual({ kind: "next" });
    expect(keyToIntent({ key: "ArrowUp", axis: "y", readingDirection: "ltr", slideCount: 5 })).toEqual({ kind: "prev" });
  });

  test("Invariant 14: RTL swaps left/right only", () => {
    expect(keyToIntent({ key: "ArrowRight", axis: "x", readingDirection: "rtl", slideCount: 5 })).toEqual({ kind: "prev" });
    expect(keyToIntent({ key: "ArrowLeft", axis: "x", readingDirection: "rtl", slideCount: 5 })).toEqual({ kind: "next" });

    // vertical unaffected by rtl
    expect(keyToIntent({ key: "ArrowDown", axis: "y", readingDirection: "rtl", slideCount: 5 })).toEqual({ kind: "next" });
    expect(keyToIntent({ key: "ArrowUp", axis: "y", readingDirection: "rtl", slideCount: 5 })).toEqual({ kind: "prev" });
  });

  test("Invariant 15: Home -> 0, End -> slideCount-1", () => {
    expect(keyToIntent({ key: "Home", axis: "x", readingDirection: "ltr", slideCount: 5 })).toEqual({ kind: "goTo", index: 0 });
    expect(keyToIntent({ key: "End", axis: "x", readingDirection: "ltr", slideCount: 5 })).toEqual({ kind: "goTo", index: 4 });

    expect(keyToIntent({ key: "End", axis: "x", readingDirection: "ltr", slideCount: 0 })).toEqual({ kind: "goTo", index: 0 });
  });
});
