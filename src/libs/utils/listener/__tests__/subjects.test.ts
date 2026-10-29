import { CurrentValueSubject, PassthroughSubject } from '#/libs/utils/listener';

describe('CurrentValueSubject', () => {
  it('exposes the initial value', () => {
    const subject = new CurrentValueSubject(1);
    expect(subject.value).toBe(1);
  });

  it('calls a new subscriber with the current value immediately by default', () => {
    const subject = new CurrentValueSubject('a');
    const callback = jest.fn();

    subject.subscribe(callback);

    expect(callback).toHaveBeenCalledWith('a');
  });

  it('skips the immediate call when immediate is false', () => {
    const subject = new CurrentValueSubject('a');
    const callback = jest.fn();

    subject.subscribe(callback, { immediate: false });

    expect(callback).not.toHaveBeenCalled();
  });

  it('updates the value and notifies subscribers on send', () => {
    const subject = new CurrentValueSubject(0);
    const callback = jest.fn();
    subject.subscribe(callback, { immediate: false });

    subject.send(5);

    expect(subject.value).toBe(5);
    expect(callback).toHaveBeenCalledWith(5);
  });

  it('stops notifying after unsubscribe', () => {
    const subject = new CurrentValueSubject(0);
    const callback = jest.fn();
    const unsubscribe = subject.subscribe(callback, { immediate: false });

    unsubscribe();
    subject.send(1);

    expect(callback).not.toHaveBeenCalled();
  });
});

describe('PassthroughSubject', () => {
  it('delivers only values sent after subscribing', () => {
    const subject = new PassthroughSubject<number>();
    subject.send(1);
    const callback = jest.fn();

    subject.subscribe(callback);
    subject.send(2);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(2);
  });

  it('stops notifying after unsubscribe', () => {
    const subject = new PassthroughSubject<number>();
    const callback = jest.fn();
    const unsubscribe = subject.subscribe(callback);

    unsubscribe();
    subject.send(1);

    expect(callback).not.toHaveBeenCalled();
  });
});

describe('Publisher operators', () => {
  it('map transforms each value', () => {
    const subject = new PassthroughSubject<number>();
    const callback = jest.fn();

    subject.map((n) => n * 2).subscribe(callback);
    subject.send(3);

    expect(callback).toHaveBeenCalledWith(6);
  });

  it('filter drops values that fail the predicate', () => {
    const subject = new PassthroughSubject<number>();
    const callback = jest.fn();

    subject.filter((n) => n > 1).subscribe(callback);
    subject.send(1);
    subject.send(2);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(2);
  });
});
