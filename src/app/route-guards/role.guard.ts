import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private _router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data['role'];
    const userRole = localStorage.getItem('userRole');

    if (userRole === expectedRole) {
      return true;
    }

    this._router.navigate(['/auth/login']);
    return false;
  }
}
