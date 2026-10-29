import { Assembly, DIContainer } from '#/libs/di';
import { LoggerKey } from '#/libs/logger';
import { ApiClientKey } from '#/libs/networking';
import { BreakingBadGatewayKey } from '../gateway/BreakingBadGateway';
import { BreakingBadGatewayImp } from '../gateway/BreakingBadGatewayImp';
import { FetchScreenStoreFactoryKey } from '../store/FetchScreenStore';
import { FetchScreenStoreImp } from '../store/FetchScreenStoreImp';

export class QuotesAssembly implements Assembly {
  assemble(container: DIContainer) {
    container.register(BreakingBadGatewayKey, (r) => new BreakingBadGatewayImp(r.resolve(ApiClientKey)));

    // A factory, not a store: each tab creates its own, so their states stay independent.
    container.register(FetchScreenStoreFactoryKey, (r) => {
      const gateway = r.resolve(BreakingBadGatewayKey);
      const logger = r.resolve(LoggerKey);
      return (show) => new FetchScreenStoreImp(show, gateway, logger);
    });
  }
}
