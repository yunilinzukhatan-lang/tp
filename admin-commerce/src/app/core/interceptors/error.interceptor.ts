import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Skip 401 — handled by auth interceptor
      if (error.status === 401) {
        return throwError(() => error);
      }

      let message = 'An unexpected error occurred.';

      if (error.error?.error?.message) {
        message = error.error.error.message;
        if (error.error.error.detail) {
          message += `: ${error.error.error.detail}`;
        }
      } else if (error.status === 0) {
        message = 'Unable to reach the server. Please check your connection.';
      } else if (error.status === 403) {
        message = 'You do not have permission to perform this action.';
      } else if (error.status === 404) {
        message = 'The requested resource was not found.';
      } else if (error.status >= 500) {
        message = 'A server error occurred. Please try again later.';
      }

      snackBar.open(message, 'Close', {
        duration: 5000,
        panelClass: ['snack-error'],
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });

      return throwError(() => error);
    })
  );
};
