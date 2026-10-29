import type { Theme } from './Theme';

// The original forces dark mode, so this is the only theme. System colors are UIKit's
// dark-mode values; show colors are the original's color assets (Breaking Bad's button is
// Display P3 in the asset catalog, converted to sRGB here).
export const darkTheme: Theme = {
  colors: {
    background: '#000000',
    sheetBackground: '#1C1C1E',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(235, 235, 245, 0.6)',
    separator: 'rgba(84, 84, 88, 0.65)',
    quoteBackground: 'rgba(0, 0, 0, 0.5)',
    episodeBackground: 'rgba(0, 0, 0, 0.6)',
    shows: {
      breakingBad: { button: '#00642D', shadow: '#E8B414' },
      betterCallSaul: { button: '#005884', shadow: '#2D1D16' },
      elCamino: { button: '#6B0300', shadow: '#0F0C0B' },
    },
  },
  fonts: {
    largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: '400' },
    title2: { fontSize: 22, lineHeight: 28, fontWeight: '400' },
    title3: { fontSize: 20, lineHeight: 25, fontWeight: '400' },
    body: { fontSize: 17, lineHeight: 22, fontWeight: '400' },
    subheadline: { fontSize: 15, lineHeight: 20, fontWeight: '400' },
  },
};
