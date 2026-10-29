import characterFixture from '../../__fixtures__/samplecharacter.json';
import deathFixture from '../../__fixtures__/sampledeath.json';
import episodeFixture from '../../__fixtures__/sampleepisode.json';
import quoteFixture from '../../__fixtures__/samplequote.json';
import { DIContainer } from '#/libs/di';
import { ApiClient, ApiClientKey, HttpFetchError } from '#/libs/networking';
import { QuotesAssembly } from '#/features/quotes';
import { BreakingBadGatewayKey, CharacterNotFoundError } from '../BreakingBadGateway';
import {
  BreakingBadGatewayImp,
  CHARACTERS_ENDPOINT,
  DEATHS_ENDPOINT,
  EPISODES_ENDPOINT,
  QUOTE_ENDPOINT,
} from '../BreakingBadGatewayImp';

const jsonResponse = (body: unknown): Response =>
  ({ ok: true, status: 200, json: () => Promise.resolve(body) }) as unknown as Response;

const createMockApiClient = (): jest.Mocked<ApiClient> => ({ fetch: jest.fn() });

describe('BreakingBadGatewayImp', () => {
  let apiClient: jest.Mocked<ApiClient>;
  let gateway: BreakingBadGatewayImp;

  beforeEach(() => {
    apiClient = createMockApiClient();
    gateway = new BreakingBadGatewayImp(apiClient, () => 0);
  });

  describe('fetchQuote', () => {
    it('requests a random quote for the show and maps it', async () => {
      apiClient.fetch.mockResolvedValue(jsonResponse(quoteFixture));

      const quote = await gateway.fetchQuote('Breaking Bad');

      expect(apiClient.fetch).toHaveBeenCalledWith(QUOTE_ENDPOINT, {
        query: { production: 'Breaking Bad' },
      });
      expect(quote).toEqual({ quote: quoteFixture.quote, character: 'Walter White' });
    });

    it('propagates HttpFetchError', async () => {
      const error = new HttpFetchError({ status: 500, url: '' } as Response);
      apiClient.fetch.mockRejectedValue(error);

      await expect(gateway.fetchQuote('Breaking Bad')).rejects.toBe(error);
    });
  });

  describe('fetchCharacter', () => {
    it('requests by name and returns the first match', async () => {
      apiClient.fetch.mockResolvedValue(
        jsonResponse([characterFixture, { ...characterFixture, name: 'Other' }]),
      );

      const character = await gateway.fetchCharacter('Walter White');

      expect(apiClient.fetch).toHaveBeenCalledWith(CHARACTERS_ENDPOINT, {
        query: { name: 'Walter White' },
      });
      expect(character.name).toBe('Walter White');
      expect(character.portrayedBy).toBe('Bryan Cranston');
    });

    it('rejects with CharacterNotFoundError on an empty list', async () => {
      apiClient.fetch.mockResolvedValue(jsonResponse([]));

      await expect(gateway.fetchCharacter('Nobody')).rejects.toBeInstanceOf(CharacterNotFoundError);
    });
  });

  describe('fetchDeath', () => {
    it('returns the death whose character matches ignoring case', async () => {
      apiClient.fetch.mockResolvedValue(
        jsonResponse([{ ...deathFixture, character: 'Emilio' }, deathFixture]),
      );

      const death = await gateway.fetchDeath('walter WHITE');

      expect(apiClient.fetch).toHaveBeenCalledWith(DEATHS_ENDPOINT, { query: undefined });
      expect(death?.lastWords).toBe('Well, erm... goodbye, Lydia.');
    });

    it('returns undefined when nobody matches', async () => {
      apiClient.fetch.mockResolvedValue(jsonResponse([deathFixture]));

      await expect(gateway.fetchDeath('Jesse Pinkman')).resolves.toBeUndefined();
    });
  });

  describe('fetchEpisode', () => {
    it('requests episodes for the show and picks one at random', async () => {
      const second = { ...episodeFixture, title: 'Second' };
      apiClient.fetch.mockResolvedValue(jsonResponse([episodeFixture, second]));
      const lastPick = new BreakingBadGatewayImp(apiClient, () => 0.99);

      const episode = await lastPick.fetchEpisode('El Camino');

      expect(apiClient.fetch).toHaveBeenCalledWith(EPISODES_ENDPOINT, {
        query: { production: 'El Camino' },
      });
      expect(episode?.title).toBe('Second');
    });

    it('returns undefined for an empty list', async () => {
      apiClient.fetch.mockResolvedValue(jsonResponse([]));

      await expect(gateway.fetchEpisode('El Camino')).resolves.toBeUndefined();
    });
  });
});

describe('QuotesAssembly', () => {
  it('registers the gateway on the injected ApiClient', () => {
    const container = new DIContainer();
    container.register(ApiClientKey, createMockApiClient);
    new QuotesAssembly().assemble(container);

    expect(container.resolve(BreakingBadGatewayKey)).toBeInstanceOf(BreakingBadGatewayImp);
  });
});
