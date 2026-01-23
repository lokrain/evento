import {
  clearSettled,
  createInitialSettleState,
  notifyScrollEnd,
  resetSettleTracking,
  sampleSettle,
  startSettleTracking,
} from "./settle-machine";

describe("settle-machine", () => {
  it("settles after required stable frames", () => {
    let state = createInitialSettleState();
    state = startSettleTracking(state, 2, 100);

    state = sampleSettle(state, 100, { epsilonPx: 0.5, requiredStableFrames: 2 });
    expect(state.settledToken).toBeNull();

    state = sampleSettle(state, 100, { epsilonPx: 0.5, requiredStableFrames: 2 });
    expect(state.settledToken).toBe(2);
  });

  it("settles immediately on scrollend when pending", () => {
    let state = createInitialSettleState();
    state = startSettleTracking(state, 7, 0);

    state = notifyScrollEnd(state);
    expect(state.settledToken).toBe(7);
  });

  it("clears settled token without dropping pending", () => {
    let state = createInitialSettleState();
    state = startSettleTracking(state, 3, 0);
    state = notifyScrollEnd(state);

    const cleared = clearSettled(state);
    expect(cleared.settledToken).toBeNull();
    expect(cleared.pendingToken).toBe(3);
  });

  it("resets to initial state", () => {
    let state = createInitialSettleState();
    state = startSettleTracking(state, 1, 10);
    state = notifyScrollEnd(state);

    const reset = resetSettleTracking(state);
    expect(reset).toEqual(createInitialSettleState());
  });
});