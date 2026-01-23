import { buildSettleAnnouncement, shouldAnnounce } from "./policy";

describe("shouldAnnounce", () => {
  it("suppresses when disabled", () => {
    expect(
      shouldAnnounce({ enabled: false, reducedMotion: false, reason: "settle" }),
    ).toBe(false);
  });

  it("suppresses autoplay announcements", () => {
    expect(
      shouldAnnounce({ enabled: true, reducedMotion: false, reason: "autoplay" }),
    ).toBe(false);
  });

  it("allows settle announcements", () => {
    expect(
      shouldAnnounce({ enabled: true, reducedMotion: true, reason: "settle" }),
    ).toBe(true);
  });

  it("builds settle announcements when enabled", () => {
    expect(
      buildSettleAnnouncement({
        enabled: true,
        reducedMotion: false,
        index: 1,
        total: 3,
        loop: true,
      }),
    ).toBe("Slide 2 of 3");
  });

  it("announces edges when loop disabled", () => {
    expect(
      buildSettleAnnouncement({
        enabled: true,
        reducedMotion: false,
        index: 0,
        total: 4,
        loop: false,
      }),
    ).toBe("Carousel start");
    expect(
      buildSettleAnnouncement({
        enabled: true,
        reducedMotion: false,
        index: 3,
        total: 4,
        loop: false,
      }),
    ).toBe("Carousel end");
  });
});