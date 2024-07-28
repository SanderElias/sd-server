import { HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, of, startWith } from 'rxjs';

import type { DataResult } from './data-result.model';

/**
 * Helper rxjs operator to convert an stream to a DataResult
 * Takes an observable that returns a value<T> or an error and
 * returns an observable that returns a DataResult
 * @returns Observable<DataResult<T>>
 */
export const toDataResult =
  () =>
  <T>(source: Observable<T>): Observable<DataResult<T>> =>
    source.pipe(
      catchError((e) => of(e)), // move the error into the stream
      map((data) => {
        // create a DataResult from the data
        const result: DataResult<T> = { loading: false };
        if (data instanceof HttpErrorResponse || data instanceof Error) {
          result.error = data as HttpErrorResponse;
        } else {
          result.data = data;
        }
        return result;
      }),
      startWith({ loading: true } as DataResult<T>),
    );

/**
 * Helper to wrap a promise into a DataResult. Takes a promise
 * When te promise errors, it returns a data-result with te error,
 * otherwise the result will be wrapped.
 * @param prom: Promise<X>
 * @returns Promise<DataResult<X>
 */
export const promiseToDataResult = <T>(prom: Promise<T>): Promise<DataResult<T>> =>
  prom.then((result) => ({ loading: false, data: result })).catch((reason) => ({ loading: false, error: reason }));
