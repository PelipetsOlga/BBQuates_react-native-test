import { StyleSheet, Text, type TextProps } from 'react-native';
import { type Theme, type ThemeFonts, useThemedStyles } from '../../theme';

export type AppTextProps = TextProps & {
  /** An iOS text style. SwiftUI's default is `body` (17pt); RN's own default is 14pt. */
  variant?: keyof ThemeFonts;
};

// Text in the theme's primary color and an iOS text style — `Text(...).font(.title2)`.
export function AppText({ variant = 'body', style, ...props }: AppTextProps): React.JSX.Element {
  const styles = useThemedStyles(createStyles);
  // A shrinking text keeps a fixed lineHeight at its full size, which spreads the scaled-down
  // lines apart; drop it so the line height scales with the font, as in SwiftUI.
  const shrinkable = props.adjustsFontSizeToFit && styles.autoLineHeight;
  return <Text {...props} style={[styles.base, styles[variant], shrinkable, style]} />;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    base: { color: theme.colors.textPrimary },
    autoLineHeight: { lineHeight: undefined },
    largeTitle: theme.fonts.largeTitle,
    title2: theme.fonts.title2,
    title3: theme.fonts.title3,
    body: theme.fonts.body,
    subheadline: theme.fonts.subheadline,
  });
