import { ServiceKey } from './serviceKey';
import { ServiceResolver } from './serviceResolver';

export enum DIScope {
  /** One lazily created instance per container (the default), like a Hilt @Singleton. */
  Container = 'container',
  /** A new instance on every resolve. */
  Transient = 'transient',
}

type Factory<T> = (resolver: ServiceResolver) => T;

// Trimmed port of wellforge-platform `libs/di`. Keys are matched by symbol identity, so two
// keys with the same description never collide.
export class DIContainer implements ServiceResolver {
  private factories = new Map<symbol, () => unknown>();
  private singletons = new Map<symbol, unknown>();

  register<T>(key: ServiceKey<T>, factory: Factory<T>, options: { scope?: DIScope } = {}) {
    if (this.factories.has(key)) {
      throw new Error(`Factory already registered for key: ${key.toString()}`);
    }
    this.setFactory(key, factory, options.scope ?? DIScope.Container);
  }

  /** Replaces a registration — meant for tests. */
  override<T>(key: ServiceKey<T>, factory: Factory<T>, options: { scope?: DIScope } = {}) {
    this.singletons.delete(key);
    this.setFactory(key, factory, options.scope ?? DIScope.Container);
  }

  resolve<T>(key: ServiceKey<T>): T {
    const factory = this.factories.get(key);
    if (!factory) {
      throw new Error(`Unable to resolve type: ${key.toString()}`);
    }
    return factory() as T;
  }

  private setFactory<T>(key: ServiceKey<T>, factory: Factory<T>, scope: DIScope) {
    switch (scope) {
      case DIScope.Transient:
        this.factories.set(key, () => factory(this));
        break;
      case DIScope.Container:
        this.factories.set(key, () => {
          if (!this.singletons.has(key)) {
            this.singletons.set(key, factory(this));
          }
          return this.singletons.get(key);
        });
        break;
    }
  }
}
