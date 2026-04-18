import { Injectable, inject } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  GuardResult,
  MaybeAsync,
  RouterStateSnapshot,
} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private _router = inject(Router);

  canActivate(): boolean {
    const token = localStorage.getItem('accessToken');

    if (token) {
      return true;
    }
    this._router.navigate(['auth/login']);
    return false;
  }
}
