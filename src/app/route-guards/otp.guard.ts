import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class OTPGuard implements CanActivate {
  private router = inject(Router);


  canActivate(): boolean {
    const otpVerified = localStorage.getItem('otpVerified');
    if (otpVerified === 'true') {
      return true;
    }
    this.router.navigate(['/signup']);
    return false;
  }
}
