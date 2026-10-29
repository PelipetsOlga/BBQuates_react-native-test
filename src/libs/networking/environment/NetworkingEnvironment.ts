import { createServiceKey } from '#/libs/di';

export type NetworkingEnvironment = {
  /** Base URL that every endpoint is appended to, without a trailing slash. */
  baseUrl: string;
};

export const NetworkingEnvironmentKey = createServiceKey<NetworkingEnvironment>('NetworkingEnvironment');

export const breakingBadEnvironment: NetworkingEnvironment = {
  baseUrl: 'https://breaking-bad-api-six.vercel.app/api',
};
