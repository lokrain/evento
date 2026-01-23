export function formatSlideAnnouncement(params: {
  readonly index: number;
  readonly total: number;
  readonly prefix?: string;
}): string {
  const total = Math.max(1, Math.trunc(params.total));
  const index = Math.max(0, Math.trunc(params.index));

  const n = Math.min(index + 1, total);
  const p = params.prefix ?? "Slide";

  return `${p} ${n} of ${total}`;
}

export function formatEdgeAnnouncement(params: {
  readonly kind: "start" | "end";
  readonly prefix?: string;
}): string {
  const p = params.prefix ?? "Carousel";
  return params.kind === "start"
    ? `${p} start`
    : `${p} end`;
}
