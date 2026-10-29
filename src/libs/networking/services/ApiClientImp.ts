import type { NetworkingEnvironment } from '../environment/NetworkingEnvironment';
import { HttpFetchError } from '../errors/HttpFetchError';
import type { ApiClient, HttpRequestConfig } from './ApiClient';

// The one place that calls the global `fetch` (WellForge "one fetch path" rule).
export class ApiClientImp implements ApiClient {
  constructor(private readonly environment: NetworkingEnvironment) {}

  async fetch(endpoint: string, config: HttpRequestConfig = {}): Promise<Response> {
    const url = this.buildUrl(endpoint, config);
    const response = await fetch(url);

    if (!response.ok) {
      throw new HttpFetchError(response, `Invalid status code: ${response.status}`);
    }
    return response;
  }

  private buildUrl(endpoint: string, { query }: HttpRequestConfig): string {
    const url = `${this.environment.baseUrl}/${endpoint}`;
    if (!query || Object.keys(query).length === 0) return url;
    // URLSearchParams encodes spaces as `+`: `production=Breaking+Bad`.
    return `${url}?${new URLSearchParams(query).toString()}`;
  }
}
