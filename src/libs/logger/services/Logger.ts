import { createServiceKey } from '#/libs/di';

export type LogDetails = {
  attributes?: Record<string, unknown>;
  error?: unknown;
};

// The one logging API for app code — no stray console.log (WellForge rule).
export interface Logger {
  debug(message: string, details?: LogDetails): void;
  info(message: string, details?: LogDetails): void;
  warn(message: string, details?: LogDetails): void;
  error(message: string, details?: LogDetails): void;
}

export const LoggerKey = createServiceKey<Logger>('Logger');
