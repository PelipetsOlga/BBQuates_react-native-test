import { useMemo } from 'react';
import { useService } from '#/libs/di';
import type { Show } from '../../../models';
import { type FetchScreenStore, FetchScreenStoreFactoryKey } from '../../../store';

/** This tab's own store, created once per show — the original's `let vm = ViewModel()`. */
export function useFetchScreenStore(show: Show): FetchScreenStore {
  const factory = useService(FetchScreenStoreFactoryKey);
  return useMemo(() => factory(show), [factory, show]);
}
