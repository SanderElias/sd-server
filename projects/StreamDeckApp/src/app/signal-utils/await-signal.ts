import { effect, type Signal } from '@angular/core';

import { Deferred } from './deferred';

export type Predicate<T> = (x: Partial<T>) => boolean;

export const awaitSignal = <T extends {}>(signal: Signal<T>, predicate: Predicate<T>) => {
  const deferred = new Deferred<T>();
  const effectRef = effect(
    () => {
      const result = signal();
      if (predicate(result)) {
        deferred.resolve(result);
        effectRef.destroy(); // stop watching the signal, we are done!
      }
    },
    { manualCleanup: true },
  );
  return deferred.promise;
};
