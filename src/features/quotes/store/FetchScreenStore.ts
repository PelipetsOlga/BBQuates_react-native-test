import { createServiceKey } from '#/libs/di';
import type { CurrentValueSubject } from '#/libs/utils';
import type { Show } from '../models';
import type { FetchStatus } from './FetchStatus';

/** State of one show's screen — the original's `ViewModel`. */
export interface FetchScreenStore {
  readonly status$: CurrentValueSubject<FetchStatus>;
  /** Quote, then its character, then that character's death. */
  getQuoteData(): Promise<void>;
  /** A random episode; stays `fetching` on an empty list, as the original does. */
  getEpisode(): Promise<void>;
}

/** One store per tab, like `let vm = ViewModel()` in each `FetchView`. */
export type FetchScreenStoreFactory = (show: Show) => FetchScreenStore;

export const FetchScreenStoreFactoryKey =
  createServiceKey<FetchScreenStoreFactory>('FetchScreenStoreFactory');
