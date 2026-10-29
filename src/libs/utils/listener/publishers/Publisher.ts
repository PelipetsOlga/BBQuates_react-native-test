// A minimal Combine-style stream: `subscribe` returns its own unsubscribe.
// Trimmed port of wellforge-platform `libs/utils/listener` — only the operators this app uses.
export type Unsubscribe = () => void;

export abstract class Publisher<T> {
  abstract subscribe(callback: (value: T) => void): Unsubscribe;

  map<U>(transform: (value: T) => U): Publisher<U> {
    return new MapPublisher(this, transform);
  }

  filter(predicate: (value: T) => boolean): Publisher<T> {
    return new FilterPublisher(this, predicate);
  }
}

class MapPublisher<T, U> extends Publisher<U> {
  constructor(
    private readonly base: Publisher<T>,
    private readonly transform: (value: T) => U,
  ) {
    super();
  }

  subscribe(callback: (value: U) => void): Unsubscribe {
    return this.base.subscribe((value) => callback(this.transform(value)));
  }
}

class FilterPublisher<T> extends Publisher<T> {
  constructor(
    private readonly base: Publisher<T>,
    private readonly predicate: (value: T) => boolean,
  ) {
    super();
  }

  subscribe(callback: (value: T) => void): Unsubscribe {
    return this.base.subscribe((value) => {
      if (this.predicate(value)) callback(value);
    });
  }
}
