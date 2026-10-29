import { createServiceKey } from '#/libs/di';
import type { Character, Death, Episode, Quote, Show } from '../models';

/** The Breaking Bad API, like the original's `FetchService`. Every method rejects on a non-2xx. */
export interface BreakingBadGateway {
  /** `GET /quotes/random?production=<show>`. */
  fetchQuote(show: Show): Promise<Quote>;
  /** `GET /characters?name=<name>`, first match. Rejects with `CharacterNotFoundError` on none. */
  fetchCharacter(name: string): Promise<Character>;
  /** `GET /deaths`, the entry whose character matches `name` ignoring case, or `undefined`. */
  fetchDeath(name: string): Promise<Death | undefined>;
  /** `GET /episodes?production=<show>`, a random element, or `undefined` for an empty list. */
  fetchEpisode(show: Show): Promise<Episode | undefined>;
}

export const BreakingBadGatewayKey = createServiceKey<BreakingBadGateway>('BreakingBadGateway');

/** The original crashes on an empty `/characters` result; this app shows an error instead. */
export class CharacterNotFoundError extends Error {
  constructor(name: string) {
    super(`Character not found: ${name}`);
    this.name = 'CharacterNotFoundError';
  }
}
