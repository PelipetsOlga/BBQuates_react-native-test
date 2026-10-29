import { DIContainer } from '#/libs/di';
import { ApiClientKey, HttpFetchError, NetworkingAssembly } from '#/libs/networking';
import { ApiClientImp } from '../services/ApiClientImp';

const response = (status: number): Response =>
  ({ status, ok: status >= 200 && status < 300, url: 'https://example.test/x' }) as Response;

describe('ApiClientImp', () => {
  const fetchMock = jest.fn<Promise<Response>, [string]>();
  const client = new ApiClientImp({ baseUrl: 'https://example.test/api' });

  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  it('builds the URL from the base URL, endpoint and query', async () => {
    fetchMock.mockResolvedValue(response(200));

    await client.fetch('quotes/random', { query: { production: 'Breaking Bad' } });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.test/api/quotes/random?production=Breaking+Bad',
    );
  });

  it('omits the query string when there is no query', async () => {
    fetchMock.mockResolvedValue(response(200));

    await client.fetch('deaths');

    expect(fetchMock).toHaveBeenCalledWith('https://example.test/api/deaths');
  });

  it('resolves with a 200 response', async () => {
    const ok = response(200);
    fetchMock.mockResolvedValue(ok);

    await expect(client.fetch('deaths')).resolves.toBe(ok);
  });

  it('rejects a non-2xx response with HttpFetchError carrying the status', async () => {
    fetchMock.mockResolvedValue(response(500));

    const error = await client.fetch('deaths').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(HttpFetchError);
    expect((error as HttpFetchError).status).toBe(500);
    expect((error as HttpFetchError).message).toBe('Invalid status code: 500');
  });

  it('passes a transport failure through', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'));

    await expect(client.fetch('deaths')).rejects.toThrow('Network request failed');
  });
});

describe('NetworkingAssembly', () => {
  it('registers an ApiClient for the Breaking Bad API', () => {
    const container = new DIContainer();
    new NetworkingAssembly().assemble(container);

    expect(container.resolve(ApiClientKey)).toBeInstanceOf(ApiClientImp);
  });
});
