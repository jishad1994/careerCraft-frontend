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

export const authInterceptor: HttpInterceptorFn = function (req, next) {
  const authReq = req.clone({ withCredentials: true });

  const router = inject(Router);

  const authService = inject(AuthService);

  const snackBar = inject(MatSnackBar);

  return next(authReq).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        console.log(`response from ${req.url}`);
      }
    }),
    catchError((error: HttpErrorResponse) => {
      //access token expired
      if (
        error.status === 401 &&
        !req.url.includes(API_ENDPOINTS.AUTH.REFRESH())
      ) {
        return authService.refresh().pipe(
          switchMap(() => {
            const retryReq = req.clone({ withCredentials: true });
            return next(retryReq);
          }),

          catchError((refreshError) => {
            //refresh token expired or invalid

            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }
      
      // Other errors
      return throwError(() => error);
    })
  );
};
