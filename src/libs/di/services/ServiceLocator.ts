import { ServiceResolver } from './serviceResolver';

// Global access point for React code (`useService`); set once at startup by `configureDI`.
export class ServiceLocator {
  private static resolver?: ServiceResolver;

  static get instance(): ServiceResolver {
    if (!ServiceLocator.resolver) {
      throw new Error('Trying to access ServiceLocator before setResolver is called.');
    }
    return ServiceLocator.resolver;
  }

  static setResolver(resolver: ServiceResolver) {
    ServiceLocator.resolver = resolver;
  }
}
