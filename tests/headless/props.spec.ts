import { expect, test } from "@playwright/test";
import { mergeHeadlessProps, mergeProps } from "../../src/components/headless/core/props";

test.describe("headless props", () => {
  test("merges className and style", () => {
    const internal = { className: "base", style: { color: "red", padding: 4 } };
    const user = { className: "custom", style: { padding: 8 } };

    const merged = mergeProps(internal, user);

    expect(merged.className).toBe("base custom");
    expect(merged.style).toEqual({ color: "red", padding: 8 });
  });

  test("composes event handlers with user-first veto", () => {
    const calls: string[] = [];
    const internal = {
      onClick: () => calls.push("internal"),
    };
    const user = {
      onClick: (event: { defaultPrevented: boolean; preventDefault: () => void }) => {
        calls.push("user");
        event.preventDefault();
      },
    };

    const merged = mergeProps(internal, user);
    const event = {
      defaultPrevented: false,
      preventDefault() {
        this.defaultPrevented = true;
      },
    };

    merged.onClick?.(event);

    expect(calls).toEqual(["user"]);
  });

  test("composes refs", () => {
    let internalNode: HTMLElement | null = null;
    let userNode: HTMLElement | null = null;

    const internal = {
      ref: (node: HTMLElement | null) => {
        internalNode = node;
      },
    };
    const user = {
      ref: (node: HTMLElement | null) => {
        userNode = node;
      },
    };

    const merged = mergeProps(internal, user);
    const node = {} as HTMLElement;

    merged.ref?.(node);

    expect(internalNode).toBe(node);
    expect(userNode).toBe(node);
  });

  test("mergeHeadlessProps returns internal defaults", () => {
    const merged = mergeHeadlessProps({ role: "region" }, { "aria-label": "Carousel" });

    expect(merged.role).toBe("region");
    expect(merged["aria-label"]).toBe("Carousel");
  });
});
