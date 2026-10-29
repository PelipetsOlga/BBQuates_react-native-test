import { useMemo } from 'react';
import { ServiceKey } from '../services/serviceKey';
import { ServiceLocator } from '../services/ServiceLocator';

export function useService<T>(key: ServiceKey<T>): T {
  return useMemo(() => ServiceLocator.instance.resolve(key), [key]);
}
