import { renderHook } from '@testing-library/react-native';
import { createServiceKey, DIContainer, DIScope, ServiceLocator, useService } from '#/libs/di';

interface Counter {
  readonly id: number;
}

const CounterKey = createServiceKey<Counter>('Counter');

describe('DIContainer', () => {
  it('resolves a registered service', () => {
    const container = new DIContainer();
    container.register(CounterKey, () => ({ id: 1 }));

    expect(container.resolve(CounterKey).id).toBe(1);
  });

  it('creates a container-scoped service lazily and only once', () => {
    const container = new DIContainer();
    const factory = jest.fn(() => ({ id: 1 }));
    container.register(CounterKey, factory);

    expect(factory).not.toHaveBeenCalled();

    const first = container.resolve(CounterKey);
    const second = container.resolve(CounterKey);

    expect(factory).toHaveBeenCalledTimes(1);
    expect(first).toBe(second);
  });

  it('creates a new transient instance on every resolve', () => {
    const container = new DIContainer();
    let next = 0;
    container.register(CounterKey, () => ({ id: ++next }), { scope: DIScope.Transient });

    expect(container.resolve(CounterKey).id).toBe(1);
    expect(container.resolve(CounterKey).id).toBe(2);
  });

  it('passes itself as the resolver to factories', () => {
    const container = new DIContainer();
    const DoubleKey = createServiceKey<number>('Double');
    container.register(CounterKey, () => ({ id: 21 }));
    container.register(DoubleKey, (r) => r.resolve(CounterKey).id * 2);

    expect(container.resolve(DoubleKey)).toBe(42);
  });

  it('throws on an unregistered key', () => {
    const container = new DIContainer();

    expect(() => container.resolve(CounterKey)).toThrow('Unable to resolve type: Symbol(Counter)');
  });

  it('throws on a duplicate registration', () => {
    const container = new DIContainer();
    container.register(CounterKey, () => ({ id: 1 }));

    expect(() => container.register(CounterKey, () => ({ id: 2 }))).toThrow(
      'Factory already registered',
    );
  });

  it('keeps keys with the same description apart', () => {
    const container = new DIContainer();
    const OtherCounterKey = createServiceKey<Counter>('Counter');
    container.register(CounterKey, () => ({ id: 1 }));
    container.register(OtherCounterKey, () => ({ id: 2 }));

    expect(container.resolve(CounterKey).id).toBe(1);
    expect(container.resolve(OtherCounterKey).id).toBe(2);
  });

  it('override replaces a registration and its cached instance', () => {
    const container = new DIContainer();
    container.register(CounterKey, () => ({ id: 1 }));
    container.resolve(CounterKey);

    container.override(CounterKey, () => ({ id: 2 }));

    expect(container.resolve(CounterKey).id).toBe(2);
  });
});

describe('useService', () => {
  it('resolves through the ServiceLocator', () => {
    const container = new DIContainer();
    container.register(CounterKey, () => ({ id: 7 }));
    ServiceLocator.setResolver(container);

    const { result } = renderHook(() => useService(CounterKey));

    expect(result.current.id).toBe(7);
  });
});
