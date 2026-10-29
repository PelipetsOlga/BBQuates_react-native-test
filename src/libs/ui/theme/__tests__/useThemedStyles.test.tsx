import { renderHook } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { darkTheme, Theme, ThemeProvider, useTheme, useThemedStyles } from '#/libs/ui/theme';

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    title: { color: theme.colors.textPrimary, ...theme.fonts.title2 },
  });

describe('theme hooks', () => {
  it('useTheme falls back to the dark theme without a provider', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current).toBe(darkTheme);
  });

  it('useThemedStyles builds styles from the provided theme', () => {
    const custom: Theme = {
      ...darkTheme,
      colors: { ...darkTheme.colors, textPrimary: '#123456' },
    };
    const { result } = renderHook(() => useThemedStyles(createStyles), {
      wrapper: ({ children }) => <ThemeProvider theme={custom}>{children}</ThemeProvider>,
    });

    expect(result.current.title).toMatchObject({ color: '#123456', fontSize: 22 });
  });

  it('useThemedStyles returns the same object across renders', () => {
    const { result, rerender } = renderHook(() => useThemedStyles(createStyles));
    const first = result.current;

    rerender({});

    expect(result.current).toBe(first);
  });
});
