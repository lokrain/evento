import { createResizeObserverMock } from "../testing/dom";
import { observeSlides } from "./slide-observer";

describe("observeSlides", () => {
  it("observes slides with data-carousel-slide-index", () => {
    const mock = createResizeObserverMock();
    mock.install();

    const root = document.createElement("div");
    const slide = document.createElement("div");
    slide.setAttribute("data-carousel-slide-index", "0");
    root.appendChild(slide);

    const detach = observeSlides(root, () => {});
    expect(mock.observed).toContain(slide);

    detach();
    mock.restore();
  });
});