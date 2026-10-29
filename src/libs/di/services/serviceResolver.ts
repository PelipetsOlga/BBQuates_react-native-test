import { ServiceKey } from './serviceKey';

export interface ServiceResolver {
  resolve<T>(key: ServiceKey<T>): T;
}
