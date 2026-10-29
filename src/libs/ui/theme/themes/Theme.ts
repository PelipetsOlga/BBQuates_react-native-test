import type { TextStyle } from 'react-native';

export type ShowColorKey = 'breakingBad' | 'betterCallSaul' | 'elCamino';

export type ShowColors = {
  /** `<Show>Button` color asset of the original. */
  button: string;
  /** `<Show>Shadow` color asset of the original. */
  shadow: string;
};

export type FontStyle = Pick<TextStyle, 'fontSize' | 'lineHeight' | 'fontWeight'>;

/** iOS text styles at the default Dynamic Type size, so the SwiftUI `.font(...)` calls map 1:1. */
export type ThemeFonts = {
  largeTitle: FontStyle;
  title2: FontStyle;
  title3: FontStyle;
  body: FontStyle;
  subheadline: FontStyle;
};

export type Theme = {
  colors: {
    background: string;
    /** Background of a presented sheet in dark mode. */
    sheetBackground: string;
    textPrimary: string;
    textSecondary: string;
    separator: string;
    /** SwiftUI `.black.opacity(0.5)` behind a quote. */
    quoteBackground: string;
    /** SwiftUI `.black.opacity(0.6)` behind an episode. */
    episodeBackground: string;
    shows: Record<ShowColorKey, ShowColors>;
  };
  fonts: ThemeFonts;
};
