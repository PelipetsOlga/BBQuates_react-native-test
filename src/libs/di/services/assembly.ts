import { DIContainer } from './diContainer';

// A feature's registrations, like a Hilt module.
export interface Assembly {
  assemble(container: DIContainer): void;
}
