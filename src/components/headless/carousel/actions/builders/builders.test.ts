import { buildAutoplaySetEnabled, buildAutoplaySetInterval } from "./build-autoplay";
import { buildNavCommitIndex, buildNavRequestGoto } from "./build-navigation";

describe("action builders", () => {
  it("builds navigation commit and request actions", () => {
    expect(buildNavRequestGoto(3, "api")).toEqual({
      type: "NAV/REQUEST",
      payload: { kind: "goto", index: 3, source: "api" },
    });

    expect(buildNavCommitIndex({ index: 2, source: "settle" })).toEqual({
      type: "NAV/COMMIT_INDEX",
      payload: { index: 2, source: "settle" },
    });
  });

  it("builds autoplay config actions", () => {
    expect(buildAutoplaySetEnabled({ enabled: true, source: "api" })).toEqual({
      type: "AUTOPLAY/SET_ENABLED",
      payload: { enabled: true, source: "api" },
    });

    expect(buildAutoplaySetInterval({ intervalMs: 2000, source: "policy" })).toEqual({
      type: "AUTOPLAY/SET_INTERVAL",
      payload: { intervalMs: 2000, source: "policy" },
    });
  });
});