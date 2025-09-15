import { Injectable } from '@angular/core';
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
  constructor(private _router: Router) {}
  canActivate(): boolean {
    const token = localStorage.getItem('accessToken');

    if (token) {
      return true;
    }
    this._router.navigate(['auth/login']);
    return false;
  }
}
