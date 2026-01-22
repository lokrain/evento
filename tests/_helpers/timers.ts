import { act } from "react-dom/test-utils";

export function flushTimers(ms: number) {
  act(() => {
    jest.advanceTimersByTime(ms);
  });
}