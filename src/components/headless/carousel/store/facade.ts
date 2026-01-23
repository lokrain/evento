import {
  selectAnnounceEnabled,
  selectLastAnnouncement,
  selectLiveMode,
} from "./selectors/select-a11y";
import { selectCanNav } from "./selectors/select-can-nav";
import {
  selectPinnedIndices,
  selectVirtualEpoch,
  selectVirtualWindow,
} from "./selectors/select-window";
import type { CarouselState } from "./state";

export interface CarouselFacade {
  readonly canNav: ReturnType<typeof selectCanNav>;
  readonly liveMode: ReturnType<typeof selectLiveMode>;
  readonly announceEnabled: ReturnType<typeof selectAnnounceEnabled>;
  readonly lastAnnouncement: ReturnType<typeof selectLastAnnouncement>;
  readonly virtualWindow: ReturnType<typeof selectVirtualWindow>;
  readonly virtualEpoch: ReturnType<typeof selectVirtualEpoch>;
  readonly pinnedIndices: ReturnType<typeof selectPinnedIndices>;
}

export function createCarouselFacade(state: CarouselState): CarouselFacade {
  return {
    canNav: selectCanNav(state),
    liveMode: selectLiveMode(state),
    announceEnabled: selectAnnounceEnabled(state),
    lastAnnouncement: selectLastAnnouncement(state),
    virtualWindow: selectVirtualWindow(state),
    virtualEpoch: selectVirtualEpoch(state),
    pinnedIndices: selectPinnedIndices(state),
  };
}
