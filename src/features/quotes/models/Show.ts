import type { ShowColorKey } from '#/libs/ui/theme';

/** The three productions, in tab order. Each value is both the tab title and the API's `production`. */
export const SHOWS = ['Breaking Bad', 'Better Call Saul', 'El Camino'] as const;

export type Show = (typeof SHOWS)[number];

/** Stable key per show for its colors and background — the original derived these from the name. */
export const SHOW_KEYS: Record<Show, ShowColorKey> = {
  'Breaking Bad': 'breakingBad',
  'Better Call Saul': 'betterCallSaul',
  'El Camino': 'elCamino',
};
