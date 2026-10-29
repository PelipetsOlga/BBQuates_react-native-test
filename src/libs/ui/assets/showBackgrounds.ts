import type { ImageSourcePropType } from 'react-native';
import type { ShowColorKey } from '../theme';

/** The original's `breakingbad` / `bettercallsaul` / `elcamino` images, downscaled to 3200px wide. */
export const SHOW_BACKGROUNDS: Record<ShowColorKey, ImageSourcePropType> = {
  breakingBad: require('#/assets/shows/breakingbad.jpg'),
  betterCallSaul: require('#/assets/shows/bettercallsaul.jpg'),
  elCamino: require('#/assets/shows/elcamino.jpg'),
};
