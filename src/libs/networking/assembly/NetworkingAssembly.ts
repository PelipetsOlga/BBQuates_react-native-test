import { Assembly, DIContainer } from '#/libs/di';
import { breakingBadEnvironment, NetworkingEnvironmentKey } from '../environment/NetworkingEnvironment';
import { ApiClientKey } from '../services/ApiClient';
import { ApiClientImp } from '../services/ApiClientImp';

export class NetworkingAssembly implements Assembly {
  assemble(container: DIContainer) {
    container.register(NetworkingEnvironmentKey, () => breakingBadEnvironment);
    container.register(ApiClientKey, (r) => new ApiClientImp(r.resolve(NetworkingEnvironmentKey)));
  }
}
