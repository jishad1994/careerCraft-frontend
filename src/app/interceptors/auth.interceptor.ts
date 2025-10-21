import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = function (req, next) {
  if (req.url.includes('/api/auth')) {
    console.log('escaped auth route')
    return next(req);
  }

  let authReq = req;
  let token = localStorage.getItem('accessToken');

  if (token) {
    authReq.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }
console.log('not escaped auth rote')
  return next(authReq);
};
