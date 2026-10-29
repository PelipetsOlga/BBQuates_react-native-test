import { Platform } from 'react-native';
import { type Show, SHOWS } from '#/features/quotes/models';
import type { NativeBottomTabIcon } from '#/libs/navigation';

export enum TabRoute {
  BreakingBad = 'BreakingBadTab',
  BetterCallSaul = 'BetterCallSaulTab',
  ElCamino = 'ElCaminoTab',
}

export type TabRouteParams = {
  [TabRoute.BreakingBad]: { show: Show };
  [TabRoute.BetterCallSaul]: { show: Show };
  [TabRoute.ElCamino]: { show: Show };
};

export type TabItem = {
  route: TabRoute;
  show: Show;
  icon: NativeBottomTabIcon;
};

// SF Symbols on iOS, as in the original. Apple's license keeps them off Android, which gets
// Material Icons (`work`, `directions_car`) and a hand-drawn tortoise instead.
function icon(sfSymbol: 'tortoise' | 'briefcase' | 'car', android: number): NativeBottomTabIcon {
  return Platform.OS === 'ios'
    ? { type: 'sfSymbol', name: sfSymbol }
    : { type: 'image', source: android };
}

const TAB_ROUTES: Record<Show, TabRoute> = {
  'Breaking Bad': TabRoute.BreakingBad,
  'Better Call Saul': TabRoute.BetterCallSaul,
  'El Camino': TabRoute.ElCamino,
};

const TAB_ICONS: Record<Show, NativeBottomTabIcon> = {
  'Breaking Bad': icon('tortoise', require('#/assets/tab-icons/tortoise.png')),
  'Better Call Saul': icon('briefcase', require('#/assets/tab-icons/work.png')),
  'El Camino': icon('car', require('#/assets/tab-icons/directions_car.png')),
};

/** The tab bar, left to right. */
export const TAB_ITEMS: TabItem[] = SHOWS.map((show) => ({
  route: TAB_ROUTES[show],
  show,
  icon: TAB_ICONS[show],
}));
