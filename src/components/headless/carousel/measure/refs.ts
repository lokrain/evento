export const createRefs = () => ({
  root: () => {},
  viewport: () => {},
  track: () => {},
  slide: (_renderIndex: number) => () => {},
});