import { useState } from 'react';
import { CurrentValueSubject } from '../subjects/CurrentValueSubject';
import { usePublisher } from './usePublisher';

// React's `collectAsState()`: renders with the subject's current value and re-renders on every send.
export function useSubjectValue<T>(subject: CurrentValueSubject<T>): T {
  const [value, setValue] = useState(subject.value);

  usePublisher(subject, (next) => {
    setValue(() => next);
  });

  return value;
}
