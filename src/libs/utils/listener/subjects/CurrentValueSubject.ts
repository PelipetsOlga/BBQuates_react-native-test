import { Publisher, Unsubscribe } from '../publishers';

export type CurrentValueSubjectSubscribeOptions = {
  immediate?: boolean;
};

// State with a current value, like Kotlin's StateFlow or Combine's CurrentValueSubject.
// By default a new subscriber is called with the current value right away.
export class CurrentValueSubject<T> extends Publisher<T> {
  private subscribers = new Set<(value: T) => void>();
  private _value: T;

  constructor(initialValue: T) {
    super();
    this._value = initialValue;
  }

  get value(): T {
    return this._value;
  }

  send(value: T) {
    this._value = value;
    for (const cb of this.subscribers) {
      cb(value);
    }
  }

  subscribe(
    callback: (value: T) => void,
    options: CurrentValueSubjectSubscribeOptions = {},
  ): Unsubscribe {
    const { immediate = true } = options;

    if (immediate) callback(this._value);

    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }
}
