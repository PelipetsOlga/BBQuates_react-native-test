import type { Character, Show } from '#/features/quotes/models';
import { type NativeStackNavigationProp, useNavigation } from '#/libs/navigation';

/** Root-stack routes. Presented screens live here, never inside a tab (WellForge rule). */
export enum AppRoute {
  TabBar = 'TabBar',
  CharacterSheet = 'CharacterSheet',
}

export type AppRouteStackParams = {
  [AppRoute.TabBar]: undefined;
  /** The last loaded character of the tab that opened the sheet. */
  [AppRoute.CharacterSheet]: { show: Show; character: Character };
};

export function useAppNavigation() {
  return useNavigation<NativeStackNavigationProp<AppRouteStackParams>>();
}
