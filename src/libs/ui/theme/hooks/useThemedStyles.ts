import { useMemo } from 'react';
import type { Theme } from '../themes/Theme';
import { useTheme } from './useTheme';

export type StyleFactory<T> = (theme: Theme) => T;

// Pass a module-level factory (`const createStyles = (theme) => StyleSheet.create(...)`) so the
// memo hits; an inline arrow recreates the styles on every render.
export function useThemedStyles<T>(factory: StyleFactory<T>): T {
  const theme = useTheme();
  return useMemo(() => factory(theme), [factory, theme]);
}
