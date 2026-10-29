import characterFixture from '../../__fixtures__/samplecharacter.json';
import deathFixture from '../../__fixtures__/sampledeath.json';
import episodeFixture from '../../__fixtures__/sampleepisode.json';
import quoteFixture from '../../__fixtures__/samplequote.json';
import { DIContainer } from '#/libs/di';
import { Logger, LoggerKey } from '#/libs/logger';
import { ApiClientKey } from '#/libs/networking';
import { QuotesAssembly } from '#/features/quotes';
import type { BreakingBadGateway } from '../../gateway/BreakingBadGateway';
import { toCharacter, toDeath, toEpisode, toQuote } from '../../models';
import { FetchScreenStoreFactoryKey } from '../FetchScreenStore';
import { FetchScreenStoreImp } from '../FetchScreenStoreImp';
import type { FetchStatus } from '../FetchStatus';

const quote = toQuote(quoteFixture);
const character = toCharacter(characterFixture);
const death = toDeath(deathFixture);
const episode = toEpisode(episodeFixture);

const createMockGateway = (): jest.Mocked<BreakingBadGateway> => ({
  fetchQuote: jest.fn().mockResolvedValue(quote),
  fetchCharacter: jest.fn().mockResolvedValue(character),
  fetchDeath: jest.fn().mockResolvedValue(death),
  fetchEpisode: jest.fn().mockResolvedValue(episode),
});

const createMockLogger = (): jest.Mocked<Logger> => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
});

function recordKinds(store: FetchScreenStoreImp): FetchStatus['kind'][] {
  const kinds: FetchStatus['kind'][] = [];
  store.status$.subscribe((status) => kinds.push(status.kind));
  return kinds;
}

describe('FetchScreenStoreImp', () => {
  let gateway: jest.Mocked<BreakingBadGateway>;
  let store: FetchScreenStoreImp;

  beforeEach(() => {
    gateway = createMockGateway();
    store = new FetchScreenStoreImp('Breaking Bad', gateway, createMockLogger());
  });

  it('starts as notStarted', () => {
    expect(store.status$.value).toEqual({ kind: 'notStarted' });
  });

  describe('getQuoteData', () => {
    it('goes notStarted → fetching → successQuote', async () => {
      const kinds = recordKinds(store);

      await store.getQuoteData();

      expect(kinds).toEqual(['notStarted', 'fetching', 'successQuote']);
    });

    it('chains quote → character by the quote name → death by the character name', async () => {
      await store.getQuoteData();

      expect(gateway.fetchQuote).toHaveBeenCalledWith('Breaking Bad');
      expect(gateway.fetchCharacter).toHaveBeenCalledWith(quote.character);
      expect(gateway.fetchDeath).toHaveBeenCalledWith(character.name);
    });

    it('attaches the found death to the character', async () => {
      await store.getQuoteData();

      expect(store.status$.value).toEqual({
        kind: 'successQuote',
        quote,
        character: { ...character, death },
      });
    });

    it('leaves the character without a death when none matches', async () => {
      gateway.fetchDeath.mockResolvedValue(undefined);

      await store.getQuoteData();

      const status = store.status$.value;
      expect(status.kind === 'successQuote' && status.character.death).toBeUndefined();
    });

    it.each(['fetchQuote', 'fetchCharacter', 'fetchDeath'] as const)(
      'fails when %s rejects',
      async (method) => {
        const error = new Error(`${method} broke`);
        gateway[method].mockRejectedValue(error);

        await store.getQuoteData();

        expect(store.status$.value).toEqual({ kind: 'failed', error });
      },
    );
  });

  describe('getEpisode', () => {
    it('goes fetching → successEpisode', async () => {
      const kinds = recordKinds(store);

      await store.getEpisode();

      expect(gateway.fetchEpisode).toHaveBeenCalledWith('Breaking Bad');
      expect(kinds).toEqual(['notStarted', 'fetching', 'successEpisode']);
      expect(store.status$.value).toEqual({ kind: 'successEpisode', episode });
    });

    it('stays fetching on an empty episode list, as the original does', async () => {
      gateway.fetchEpisode.mockResolvedValue(undefined);

      await store.getEpisode();

      expect(store.status$.value).toEqual({ kind: 'fetching' });
    });

    it('fails when the request rejects', async () => {
      const error = new Error('episodes broke');
      gateway.fetchEpisode.mockRejectedValue(error);

      await store.getEpisode();

      expect(store.status$.value).toEqual({ kind: 'failed', error });
    });
  });
});

describe('FetchScreenStoreFactory', () => {
  it('creates an independent store per call', async () => {
    const container = new DIContainer();
    container.register(LoggerKey, createMockLogger);
    container.register(ApiClientKey, () => ({ fetch: jest.fn() }));
    new QuotesAssembly().assemble(container);
    const factory = container.resolve(FetchScreenStoreFactoryKey);

    const first = factory('Breaking Bad');
    const second = factory('El Camino');

    expect(first).not.toBe(second);
    expect(first.status$).not.toBe(second.status$);
  });
});
