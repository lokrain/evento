import { formatEdgeAnnouncement, formatSlideAnnouncement } from "./format";

describe("formatSlideAnnouncement", () => {
  it("formats slide index with total", () => {
    expect(formatSlideAnnouncement({ index: 0, total: 3 })).toBe("Slide 1 of 3");
  });

  it("clamps total to at least 1", () => {
    expect(formatSlideAnnouncement({ index: 4, total: 0 })).toBe("Slide 1 of 1");
  });
});

describe("formatEdgeAnnouncement", () => {
  it("formats start/end announcements", () => {
    expect(formatEdgeAnnouncement({ kind: "start" })).toBe("Carousel start");
    expect(formatEdgeAnnouncement({ kind: "end" })).toBe("Carousel end");
  });
});