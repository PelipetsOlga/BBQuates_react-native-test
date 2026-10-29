import { useContext } from 'react';
import { ThemeContext } from '../theme-provider';
import type { Theme } from '../themes/Theme';

export const useTheme = (): Theme => useContext(ThemeContext);
