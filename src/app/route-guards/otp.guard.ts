import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class OTPGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const otpVerified = localStorage.getItem('otpVerified');
    if (otpVerified === 'true') {
      return true;
    }
    this.router.navigate(['/signup']);
    return false;
  }
}
