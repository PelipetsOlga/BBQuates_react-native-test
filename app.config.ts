import type { ExpoConfig } from 'expo/config';

// Single source of truth for native config. `expo prebuild` generates the
// gitignored android/ and ios/ projects from this file — never edit those by hand.
const config: ExpoConfig = {
  name: 'BBQ React Test',
  slug: 'bbq-react-test',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.bbq.reacttest',
  },
  android: {
    package: 'com.bbq.reacttest',
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
};

export default config;
