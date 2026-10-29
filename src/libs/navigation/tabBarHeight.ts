import { createContext, useContext } from 'react';

// Height of the native tab bar including the bottom safe area, provided by the tab navigator.
// Same shape as wellforge-platform `libs/utils/navigation/hooks/useTabBarHeight`.
export const TabBarHeightContext = createContext<number | undefined>(undefined);

/** 0 outside a tab navigator. */
export function useTabBarHeight(): number {
  return useContext(TabBarHeightContext) ?? 0;
}
