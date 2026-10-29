import type { Character, Episode, Quote } from '../models';

/** The original ViewModel's `FetchStatus`, with each success carrying its data. */
export type FetchStatus =
  | { kind: 'notStarted' }
  | { kind: 'fetching' }
  | { kind: 'successQuote'; quote: Quote; character: Character }
  | { kind: 'successEpisode'; episode: Episode }
  | { kind: 'failed'; error: Error };
