import { createContext } from 'react';
import { darkTheme } from '../themes/darkTheme';
import type { Theme } from '../themes/Theme';

export const ThemeContext = createContext<Theme>(darkTheme);

export type ThemeProviderProps = {
  children: React.ReactNode;
  theme?: Theme;
};

export function ThemeProvider({ children, theme = darkTheme }: ThemeProviderProps): React.JSX.Element {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}
