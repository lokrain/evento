import type { CarouselBindings } from "../engine/types-public";

// Thin adapter placeholder. Real DOM/ARIA wiring will be implemented later.
export function useCarouselBindings(): CarouselBindings {
  // Delegates to the bindings returned by useCarousel; this helper allows custom wiring later.
  return {
    getRootProps: (user: any = {}) => ({ ...user }),
    getViewportProps: (user: any = {}) => ({ ...user }),
    getTrackProps: (user: any = {}) => ({ ...user }),
    getSlideProps: (_renderIndex: number, user: any = {}) => ({ ...user }),
    getPrevButtonProps: (user: any = {}) => ({ ...user }),
    getNextButtonProps: (user: any = {}) => ({ ...user }),
    pagination: {
      count: 0,
      index: 0,
      getListProps: (user: any = {}) => ({ ...user }),
      getDotProps: (_index: number, user: any = {}) => ({ ...user }),
    },
    autoplayToggle: {
      getButtonProps: (user: any = {}) => ({ ...user }),
    },
    announcer: {
      message: null,
      getProps: (user: any = {}) => ({ ...user }),
    },
  };
}

export default useCarouselBindings;