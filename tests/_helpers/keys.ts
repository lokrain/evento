export function dispatchKey(target: Element, key: string, init: Partial<KeyboardEventInit> = {}) {
  const ev = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key, ...init });
  target.dispatchEvent(ev);
}