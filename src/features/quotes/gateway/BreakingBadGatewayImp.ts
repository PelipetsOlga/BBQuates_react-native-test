import type { ApiClient } from '#/libs/networking';
import {
  type Character,
  type CharacterDto,
  type Death,
  type DeathDto,
  type Episode,
  type EpisodeDto,
  type Quote,
  type QuoteDto,
  type Show,
  toCharacter,
  toDeath,
  toEpisode,
  toQuote,
} from '../models';
import { type BreakingBadGateway, CharacterNotFoundError } from './BreakingBadGateway';

export const QUOTE_ENDPOINT = 'quotes/random';
export const CHARACTERS_ENDPOINT = 'characters';
export const DEATHS_ENDPOINT = 'deaths';
export const EPISODES_ENDPOINT = 'episodes';

export class BreakingBadGatewayImp implements BreakingBadGateway {
  constructor(
    private readonly apiClient: ApiClient,
    /** Returns a number in [0, 1); injectable so tests can pick the episode. */
    private readonly random: () => number = Math.random,
  ) {}

  async fetchQuote(show: Show): Promise<Quote> {
    const dto = await this.get<QuoteDto>(QUOTE_ENDPOINT, { production: show });
    return toQuote(dto);
  }

  async fetchCharacter(name: string): Promise<Character> {
    const dtos = await this.get<CharacterDto[]>(CHARACTERS_ENDPOINT, { name });
    const first = dtos[0];
    if (!first) {
      throw new CharacterNotFoundError(name);
    }
    return toCharacter(first);
  }

  async fetchDeath(name: string): Promise<Death | undefined> {
    const dtos = await this.get<DeathDto[]>(DEATHS_ENDPOINT);
    const match = dtos.find((dto) => dto.character.toLowerCase() === name.toLowerCase());
    return match ? toDeath(match) : undefined;
  }

  async fetchEpisode(show: Show): Promise<Episode | undefined> {
    const dtos = await this.get<EpisodeDto[]>(EPISODES_ENDPOINT, { production: show });
    if (dtos.length === 0) return undefined;
    const pick = dtos[Math.floor(this.random() * dtos.length)];
    return pick ? toEpisode(pick) : undefined;
  }

  private async get<T>(endpoint: string, query?: Record<string, string>): Promise<T> {
    const response = await this.apiClient.fetch(endpoint, { query });
    return (await response.json()) as T;
  }
}
