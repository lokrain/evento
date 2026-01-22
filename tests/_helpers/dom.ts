import * as React from "react";
import { act } from "react-dom/test-utils";
import { createRoot, type Root } from "react-dom/client";

export function renderIntoDocument(element: React.ReactElement) {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root: Root = createRoot(container);

  act(() => {
    root.render(element);
  });

  return {
    container,
    root,
    unmount: () => {
      act(() => root.unmount());
      container.remove();
    },
  };
}