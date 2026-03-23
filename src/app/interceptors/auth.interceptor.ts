import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpResponse,
} from '@angular/common/http';

import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { catchError, switchMap, tap, throwError } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';
import { ApiResponse } from '../models/api-response.model';
let isRefreshing = false;
export const authInterceptor: HttpInterceptorFn = function (req, next) {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Skip for external APIs or refresh endpoint
  if (
    !req.url.includes(environment.apiUrl) ||
    req.url.includes(API_ENDPOINTS.AUTH.REFRESH())
  ) {
    return next(req.clone({ withCredentials: true }));
  }

  // Clone request with credentials
  const authReq = req.clone({
    withCredentials: true,
  });

  return next(authReq).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        console.log(` Response from ${req.url}`);
      }
    }),
    catchError((error: HttpErrorResponse) => {
      // Handle 401 - Token expired
      if (error.status === 401 && !isRefreshing) {
        isRefreshing = true;

        console.log('Access token expired, refreshing...');

        return authService.refresh().pipe(
          switchMap(() => {
            isRefreshing = false;
            console.log('Token refreshed, retrying request');

            // Retry the original request
            const retryReq = req.clone({ withCredentials: true });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            isRefreshing = false;
            console.error('Refresh token failed');

            // Refresh failed - logout user
            authService.logout();
            router.navigate(['/auth/login']);

            const normalizedError: ApiResponse<null> = {
              success: false,
              message: refreshError.error?.message || 'Something went wrong',
              data: null,
              pagination: undefined,
              errors: refreshError.error?.errors || null,
              statusCode: refreshError.status,
            };
            return throwError(() => normalizedError);
          }),
        );
      }

      // Pass other errors to error interceptor

      console.log('error is thrown without touching refresh');
      return throwError(() => error);
    }),
  );
};
