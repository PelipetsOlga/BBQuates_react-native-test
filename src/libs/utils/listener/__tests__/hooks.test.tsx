import { act, renderHook } from '@testing-library/react-native';
import { CurrentValueSubject, PassthroughSubject, usePublisher, useSubjectValue } from '#/libs/utils/listener';

describe('useSubjectValue', () => {
  it('returns the current value and re-renders on send', () => {
    const subject = new CurrentValueSubject('first');
    const { result } = renderHook(() => useSubjectValue(subject));

    expect(result.current).toBe('first');

    act(() => {
      subject.send('second');
    });

    expect(result.current).toBe('second');
  });
});

describe('usePublisher', () => {
  it('calls the callback for each value while mounted', () => {
    const subject = new PassthroughSubject<number>();
    const callback = jest.fn();
    renderHook(() => usePublisher(subject, callback));

    act(() => {
      subject.send(1);
    });

    expect(callback).toHaveBeenCalledWith(1);
  });

  it('unsubscribes on unmount', () => {
    const subject = new PassthroughSubject<number>();
    const callback = jest.fn();
    const { unmount } = renderHook(() => usePublisher(subject, callback));

    unmount();
    subject.send(1);

    expect(callback).not.toHaveBeenCalled();
  });

  it('uses the latest callback without resubscribing', () => {
    const subject = new PassthroughSubject<number>();
    const first = jest.fn();
    const second = jest.fn();
    const { rerender } = renderHook(({ cb }: { cb: jest.Mock }) => usePublisher(subject, cb), {
      initialProps: { cb: first },
    });

    rerender({ cb: second });
    act(() => {
      subject.send(1);
    });

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith(1);
  });
});
