import type { LogDetails, Logger } from './Logger';

export class ConsoleLoggerImp implements Logger {
  debug(message: string, details?: LogDetails) {
    console.debug(message, ...ConsoleLoggerImp.extra(details));
  }

  info(message: string, details?: LogDetails) {
    console.info(message, ...ConsoleLoggerImp.extra(details));
  }

  warn(message: string, details?: LogDetails) {
    console.warn(message, ...ConsoleLoggerImp.extra(details));
  }

  error(message: string, details?: LogDetails) {
    console.error(message, ...ConsoleLoggerImp.extra(details));
  }

  private static extra(details?: LogDetails): unknown[] {
    return details ? [details] : [];
  }
}
