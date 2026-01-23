import { createResizeObserverMock } from "../testing/dom";
import { observeViewport } from "./viewport-observer";

describe("observeViewport", () => {
  it("uses ResizeObserver when available", () => {
    const mock = createResizeObserverMock();
    mock.install();

    const el = document.createElement("div");
    const detach = observeViewport(el, () => {});
    expect(mock.observed).toContain(el);

    detach();
    mock.restore();
  });
});