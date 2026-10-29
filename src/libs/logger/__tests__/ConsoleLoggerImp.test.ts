import { DIContainer } from '#/libs/di';
import { LoggerAssembly, LoggerKey } from '#/libs/logger';
import { ConsoleLoggerImp } from '../services/ConsoleLoggerImp';

describe('ConsoleLoggerImp', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each(['debug', 'info', 'warn', 'error'] as const)('%s writes to console.%s', (level) => {
    const spy = jest.spyOn(console, level).mockImplementation(() => {});
    const logger = new ConsoleLoggerImp();

    logger[level]('message', { attributes: { show: 'Breaking Bad' } });

    expect(spy).toHaveBeenCalledWith('message', { attributes: { show: 'Breaking Bad' } });
  });

  it('omits details when none are given', () => {
    const spy = jest.spyOn(console, 'info').mockImplementation(() => {});

    new ConsoleLoggerImp().info('message');

    expect(spy).toHaveBeenCalledWith('message');
  });
});

describe('LoggerAssembly', () => {
  it('registers the console logger', () => {
    const container = new DIContainer();
    new LoggerAssembly().assemble(container);

    expect(container.resolve(LoggerKey)).toBeInstanceOf(ConsoleLoggerImp);
  });
});
