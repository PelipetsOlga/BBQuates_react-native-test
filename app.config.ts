import type { ExpoConfig } from 'expo/config';

// Single source of truth for native config. `expo prebuild` generates the
// gitignored android/ and ios/ projects from this file — never edit those by hand.
const config: ExpoConfig = {
  name: 'BBQuates17',
  slug: 'bbq-react-test',
  version: '1.0.0',
  // 'default' lets the app rotate; iOS narrows it per device family below.
  orientation: 'default',
  icon: './assets/icon.png',
  // The original app forces dark mode (`.preferredColorScheme(.dark)`), which also
  // darkens native chrome such as the tab bar and sheets.
  userInterfaceStyle: 'dark',
  splash: {
    // The original uses the generated blank launch screen, which is black in dark mode.
    backgroundColor: '#000000',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.bbq.reacttest',
    infoPlist: {
      // Same as the original BBQuates17 target: no upside-down on iPhone, all four on iPad.
      UISupportedInterfaceOrientations: [
        'UIInterfaceOrientationPortrait',
        'UIInterfaceOrientationLandscapeLeft',
        'UIInterfaceOrientationLandscapeRight',
      ],
      'UISupportedInterfaceOrientations~ipad': [
        'UIInterfaceOrientationPortrait',
        'UIInterfaceOrientationPortraitUpsideDown',
        'UIInterfaceOrientationLandscapeLeft',
        'UIInterfaceOrientationLandscapeRight',
      ],
    },
  },
  android: {
    package: 'com.bbq.reacttest',
    // The original's full-bleed icon, shrunk into the adaptive icon's safe zone on its own
    // background color so the launcher mask never crops the artwork.
    adaptiveIcon: {
      backgroundColor: '#B3E5FC',
      foregroundImage: './assets/android-icon-foreground.png',
    },
    predictiveBackGestureEnabled: false,
  },
  plugins: ['expo-image'],
};

export default config;
