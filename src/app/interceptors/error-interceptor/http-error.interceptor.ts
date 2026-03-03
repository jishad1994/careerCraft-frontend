import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiResponse } from '../../models/api-response.model';
import { catchError, throwError } from 'rxjs';
import { API_ENDPOINTS } from '../../constants/api-endpoints.constants';
import { AuthService } from '../../services/auth/auth.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const normalizedError: ApiResponse<null> = {
        success: false,
        message: err.error?.message || 'Something went wrong',
        data: null,
        pagination: undefined,
        errors: err.error?.errors || null,
        statusCode: err.status,
      };

      // 403: Forbidden or blocked account
      if (err.status === 403) {
        snackBar.open(normalizedError.message || 'Access denied', 'Close', {
          duration: 3000,
        });
        authService.logout();
        router.navigate(['/blocked']);
      }
      if (
        err.status === 401 &&
        req.url.includes(API_ENDPOINTS.AUTH.REFRESH())
      ) {
        snackBar.open('session has expired', 'Close', {
          duration: 3000,
        });

        router.navigate(['auth/login']);
      }

      // 404 / 400: Not found / invalid request
      if (err.status === 404 || err.status === 400) {
        // snackBar.open(
        //   normalizedError.message || 'Page not found or invalid request',
        //   'Close',
        //   {
        //     duration: 3000,
        //   }
        // );
        // router.navigate(['/not-found']);
      }

      // 500: Internal server error
      if (err.status === 500) {
        snackBar.open(
          normalizedError.message || 'Internal server error',
          'Close',
          {
            duration: 3000,
          }
        );
        // router.navigate(['/error']);
      }

      // Network / unknown errors
      if (err.status === 0) {
        snackBar.open(
          'Cannot connect to server. Check your network.',
          'Close',
          {
            duration: 3000,
          }
        );
      }

      // Return normalized ApiResponse to components
      return throwError(() => normalizedError);
    })
  );
};
