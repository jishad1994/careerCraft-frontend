import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpResponse,
} from '@angular/common/http';

import { inject, Inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { catchError, switchMap, tap, throwError } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';

export const authInterceptor: HttpInterceptorFn = function (req, next) {
  //add cookies for all requests
  const authReq = req.clone({ withCredentials: true });

  const authService = inject(AuthService);

  return next(authReq).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        console.log(`response from ${req.url}`);
      }
    }),
    catchError((error: HttpErrorResponse) => {
      //case 1:access token expired
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
            //case 2:refresh token expired or invalid
            console.log(`refresh token expired or invalid`, refreshError);
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
