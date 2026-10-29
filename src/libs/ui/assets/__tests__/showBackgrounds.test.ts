import { SHOW_BACKGROUNDS } from '#/libs/ui/assets';
import type { ShowColorKey } from '#/libs/ui/theme';

const KEYS: ShowColorKey[] = ['breakingBad', 'betterCallSaul', 'elCamino'];

describe('SHOW_BACKGROUNDS', () => {
  it.each(KEYS)('has a background for %s', (key) => {
    expect(SHOW_BACKGROUNDS[key]).toBeDefined();
  });
});
