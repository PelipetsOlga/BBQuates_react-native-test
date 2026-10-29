// A response with a non-2xx status, like the original FetchService's `FetchError.badResponse`.
export class HttpFetchError extends Error {
  readonly status: number;
  readonly url: string;

  constructor(response: Response, message?: string) {
    super(message ?? `Http Error ${response.status}`);
    this.name = 'HttpFetchError';
    this.status = response.status;
    this.url = response.url;
  }
}
