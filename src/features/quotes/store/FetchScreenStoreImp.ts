import type { Logger } from '#/libs/logger';
import { CurrentValueSubject } from '#/libs/utils';
import type { BreakingBadGateway } from '../gateway/BreakingBadGateway';
import type { Show } from '../models';
import type { FetchScreenStore } from './FetchScreenStore';
import type { FetchStatus } from './FetchStatus';

export class FetchScreenStoreImp implements FetchScreenStore {
  readonly status$ = new CurrentValueSubject<FetchStatus>({ kind: 'notStarted' });

  constructor(
    private readonly show: Show,
    private readonly gateway: BreakingBadGateway,
    private readonly logger: Logger,
  ) {}

  async getQuoteData(): Promise<void> {
    this.status$.send({ kind: 'fetching' });

    try {
      const quote = await this.gateway.fetchQuote(this.show);
      const character = await this.gateway.fetchCharacter(quote.character);
      const death = await this.gateway.fetchDeath(character.name);

      this.status$.send({ kind: 'successQuote', quote, character: { ...character, death } });
      this.logger.debug('quote loaded', { attributes: { show: this.show, character: character.name } });
    } catch (error) {
      this.fail('quote failed', error);
    }
  }

  async getEpisode(): Promise<void> {
    this.status$.send({ kind: 'fetching' });

    try {
      const episode = await this.gateway.fetchEpisode(this.show);
      if (episode) {
        this.status$.send({ kind: 'successEpisode', episode });
      }
    } catch (error) {
      this.fail('episode failed', error);
    }
  }

  private fail(message: string, rawError: unknown) {
    const error = rawError instanceof Error ? rawError : new Error(String(rawError));
    this.logger.warn(message, { attributes: { show: this.show }, error });
    this.status$.send({ kind: 'failed', error });
  }
}
