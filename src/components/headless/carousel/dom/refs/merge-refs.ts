import type * as React from "react";

/**
 * Merge multiple refs (callback or object refs).
 * Enterprise-grade: no non-null assertions, no unsafe casts that leak.
 */
export function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") {
        ref(node);
      } else {
        // React.RefObject has readonly current in types, but runtime allows assignment.
        // We avoid non-null assertions and keep the cast local.
        (ref as { current: T | null }).current = node;
      }
    }
  };
}
