import { Publisher, Unsubscribe } from '../publishers';

// Fire-and-forget events: no retained value, late subscribers miss earlier sends.
export class PassthroughSubject<T> extends Publisher<T> {
  private subscribers = new Set<(value: T) => void>();

  subscribe(callback: (value: T) => void): Unsubscribe {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  send(value: T) {
    for (const cb of this.subscribers) {
      cb(value);
    }
  }
}
