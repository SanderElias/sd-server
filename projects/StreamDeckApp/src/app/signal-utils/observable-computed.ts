import { DestroyRef, effect, inject, type Signal, signal } from '@angular/core';
import { isObservable, Observable, Subject, switchMap } from 'rxjs';

type observableComputedFn<T> = () => Observable<T>;
interface observableComputed {
  <T>(cb: observableComputedFn<T>): Signal<T | undefined>;
  <X, Y>(cb: observableComputedFn<X>, initialValue: Y): Signal<X | Y>;
}
/**
 * will return a signal that takes updates from the observable.
 * @param cb A function using signals to return an observable, will resubscribe if any of the signals update
 * @param initialValue initial value, when not defined the signal will start off with being undefined
 * @returns a Signal that updates to the latest value from the observable
 */
export const observableComputed: observableComputed = <T>(
  cb: observableComputedFn<T>,
  initialValue?: T,
): Signal<T | undefined> => {
  const result = signal<T>(initialValue as T);
  inject(DestroyRef).onDestroy(() => {
    ref.destroy();
    sub.unsubscribe();
  });
  const source = new Subject<Observable<T>>();
  const ref = effect(
    () => {
      try {
        const outcome = cb();
        if (!isObservable(outcome)) {
          throw new Error(`[observableComputed] callback doesn't return an Observable!`);
        } else {
          source.next(outcome);
        }
      } catch (e) {
        //todo: Handle this better somehow.
        console.error(e);
      }
    },
    { manualCleanup: true },
  );
  const sub = source.pipe(switchMap((r) => r)).subscribe((val) => result.set(val));

  return result.asReadonly();
};
