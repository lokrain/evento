export function dispatchPointer(target: Element, type: string, init: PointerEventInit) {
  const ev = new PointerEvent(type, { bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(ev);
}