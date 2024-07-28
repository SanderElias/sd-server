import type { HttpErrorResponse } from '@angular/common/http';

export interface DataResult<T> {
  loading: boolean;
  pendingAction?: boolean;
  data?: T;
  error?: HttpErrorResponse | Error;
}
