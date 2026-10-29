import { useEffect } from 'react';
import { useLatest } from '#/libs/utils/hooks';
import { Publisher } from '../publishers';

// Subscribes for the component's lifetime and unsubscribes on unmount. The latest
// `callback` is always used, so callers don't need to memoize it.
export function usePublisher<T>(
  publisher: Publisher<T>,
  callback: (value: T) => Promise<void> | void,
) {
  const callbackRef = useLatest(callback);

  useEffect(() => {
    const unsubscribe = publisher.subscribe((value) => {
      void callbackRef.current(value);
    });
    return unsubscribe;
  }, [publisher, callbackRef]);
}
