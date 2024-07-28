import { WritableSignal } from '@angular/core';

import { DataResult } from './data-result.model';

export const setToLoading = <T>(dataResult: WritableSignal<DataResult<T>>) =>
  dataResult.update((cur) => ({ ...cur, loading: true }));
export const setLoadingDone = <T>(dataResult: WritableSignal<DataResult<T>>) =>
  dataResult.update((cur) => ({ ...cur, loading: false }));
