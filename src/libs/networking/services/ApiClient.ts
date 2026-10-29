import { createServiceKey } from '#/libs/di';

export type QueryParams = Record<string, string>;

export type HttpRequestConfig = {
  query?: QueryParams;
};

export interface ApiClient {
  /**
   * GETs `endpoint` relative to the base URL. Resolves only with a 2xx response; any other
   * status rejects with `HttpFetchError`, and a transport failure rejects with the fetch error.
   */
  fetch(endpoint: string, config?: HttpRequestConfig): Promise<Response>;
}

export const ApiClientKey = createServiceKey<ApiClient>('ApiClient');
