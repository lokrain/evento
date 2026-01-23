export function createResizeObserverMock() {
  const observed: Element[] = [];
  const original = globalThis.ResizeObserver;

  class MockResizeObserver {
    constructor(private readonly cb: ResizeObserverCallback) {}
    observe(el: Element) {
      observed.push(el);
    }
    disconnect() {
      this.cb([], this as unknown as ResizeObserver);
    }
  }

  const install = () => {
    globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
  };

  const restore = () => {
    globalThis.ResizeObserver = original;
  };

  return { observed, install, restore };
}