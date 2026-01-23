export function getSlideAriaProps(params: {
  readonly index: number;
  readonly total: number;
  readonly id?: string;
  readonly roledescription?: string | false;
}) {
  const i = Math.max(0, Math.trunc(params.index));
  const t = Math.max(1, Math.trunc(params.total));

  return {
    ...(params.id ? { id: params.id } : {}),
    role: "group" as const,
    ...(params.roledescription === false
      ? {}
      : { "aria-roledescription": params.roledescription ?? "slide" }),
    "aria-label": `Slide ${i + 1} of ${t}`,
    "data-carousel-slide-index": i,
  };
}
