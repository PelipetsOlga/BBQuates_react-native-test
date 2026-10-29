import { QuotesAssembly } from '#/features/quotes';
import { Assembly, DIContainer, ServiceLocator } from '#/libs/di';
import { LoggerAssembly } from '#/libs/logger';
import { NetworkingAssembly } from '#/libs/networking';

// Every assembly in the app, in registration order.
const assemblies: Assembly[] = [new LoggerAssembly(), new NetworkingAssembly(), new QuotesAssembly()];

export function configureDI(): DIContainer {
  const container = new DIContainer();
  for (const assembly of assemblies) {
    assembly.assemble(container);
  }
  ServiceLocator.setResolver(container);
  return container;
}
