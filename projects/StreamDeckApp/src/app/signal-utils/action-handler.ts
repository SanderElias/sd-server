import type { HttpErrorResponse } from '@angular/common/http';
import { type WritableSignal } from '@angular/core';

import type { DataResult } from './data-result.model';

interface SuccessActionResult {
  success: true;
  payload?: unknown;
}
interface ErrorActionResult {
  success: false;
  error?: Error | HttpErrorResponse | string;
}
export type ActionResult = SuccessActionResult | ErrorActionResult;
export type SuccessHandler<T> = (data: T, apiResult?: SuccessActionResult['payload']) => T | Promise<T>;
export type ErrorHandler = (
  error: ErrorActionResult['error'],
) => void | Promise<(error: ErrorActionResult['error']) => void>;

/**
 * Helper to aid actions.
 * - Handles setting Pending on an doff as needed
 * - successHandler function, called with the current data, and the result of the API call in the payload.
 * @param dataResult The writableSignal to use
 * @param action Promise with actionResult, result will be available in successHandler
 * @param successHandler function that gets the currentData, and the payload from the action.
 * @param errorHandler optional function that gets the error
 */
export const handleAction = async <T>(
  dataResult: WritableSignal<DataResult<T>>,
  action: Promise<ActionResult>,
  successHandler?: SuccessHandler<T>,
  errorHandler?: ErrorHandler,
) => {
  setToPending(dataResult);
  const result = await action;
  if (result.success) {
    if (successHandler) {
      const data = await successHandler(dataResult().data!, result.payload);
      dataResult.update((s) => ({ ...s, data }));
    }
  } else if (errorHandler) {
    await errorHandler((result as ErrorActionResult).error);
  }
  setPendingDone(dataResult);
};

export const successResult = (payload?: SuccessActionResult['payload']): SuccessActionResult => ({
  success: true,
  payload,
});
export const errorResult = (error?: ErrorActionResult['error']): ErrorActionResult => ({
  success: false,
  error,
});

export const setToPending = <T>(dataResult: WritableSignal<DataResult<T>>) =>
  dataResult.update((dr) => ({ ...dr, pendingAction: true }));
export const setPendingDone = <T>(dataResult: WritableSignal<DataResult<T>>) =>
  dataResult.update((dr) => ({ ...dr, pendingAction: false }));
