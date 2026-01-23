import { subscribeScrollEnd } from "./settle-scrollend";

describe("subscribeScrollEnd", () => {
  it("invokes callback on scrollend and unsubscribes cleanly", () => {
    const viewport = document.createElement("div");
    const onScrollEnd = jest.fn();

    const unsubscribe = subscribeScrollEnd(viewport, onScrollEnd);
    viewport.dispatchEvent(new Event("scrollend"));
    expect(onScrollEnd).toHaveBeenCalledTimes(1);

    unsubscribe();
    viewport.dispatchEvent(new Event("scrollend"));
    expect(onScrollEnd).toHaveBeenCalledTimes(1);
  });

  it("falls back to idle scroll when scrollend is unsupported", () => {
    jest.useFakeTimers();

    const viewport = document.createElement("div");
    const onScrollEnd = jest.fn();

    const unsubscribe = subscribeScrollEnd(viewport, onScrollEnd, { forceFallback: true });
    viewport.dispatchEvent(new Event("scroll"));

    jest.advanceTimersByTime(120);
    expect(onScrollEnd).toHaveBeenCalledTimes(1);

    unsubscribe();
    jest.useRealTimers();
  });
});