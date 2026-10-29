import { Assembly, DIContainer } from '#/libs/di';
import { ConsoleLoggerImp } from '../services/ConsoleLoggerImp';
import { LoggerKey } from '../services/Logger';

export class LoggerAssembly implements Assembly {
  assemble(container: DIContainer) {
    container.register(LoggerKey, () => new ConsoleLoggerImp());
  }
}
