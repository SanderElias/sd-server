import { DestroyRef, effect, inject, type Signal, signal } from '@angular/core';
import { firstValueFrom, isObservable, Observable } from 'rxjs';

import { deep_equal } from '../util/deep-equal';

type AsyncComputedFn<T> = () => Promise<T> | Observable<T>;
interface AsyncComputed {
  <T>(cb: AsyncComputedFn<T>): Signal<T | undefined>;
  <X, Y>(cb: AsyncComputedFn<X>, initialValue: Y): Signal<X | Y>;
}

/**
 * Helper to het the result of a promise, or the first emission form a observable into an signal.
 * @param cb function that uses signals and returns a promise
 * @param initialValue. optional, if not provided the initial value of the signal will be undefined.
 * @returns
 */
export const asyncComputed: AsyncComputed = <T>(
  cb: AsyncComputedFn<T>,
  initialValue?: T,
): Signal<T | undefined> => {
  const result = signal<T>(initialValue as T, { equal: deep_equal });
  inject(DestroyRef).onDestroy(() => ref.destroy());
  const ref = effect(
    async () => {
      try {
        const outcome = cb();
        if (isObservable(outcome)) {
          result.set(await firstValueFrom(outcome));
        } else {
          result.set(await outcome);
        }
      } catch (e) {
        //todo: Handle this better somehow.
        console.error(e);
      }
    },
    { manualCleanup: true },
  );

  return result.asReadonly();
};
