// src/app/services/signup-service.handler.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { IRegisterData } from '../models/auth.interface';
export interface OTPResponse {
  success: boolean;
  email: string;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SignupServiceHandler {
  constructor(
    private signupAuthService: AuthService,
    private router: Router
  ) {}

  handleSignup(
    formData: IRegisterData
    // role: 'user' | 'company'
  ): Observable<OTPResponse> {
    return this.signupAuthService.requestOTP(formData);
  }

  handleOTPResponse(
    response: OTPResponse,
    userEmail: string,
    userRole: 'user' | 'company'
  ): void {
    if (response.success) {
      this.storeUserData(response.email, userRole);
      this.navigateToOTPVerification(userEmail, userRole);
    } else {
      this.handleRegistrationError(response.message);
    }
  }

  private storeUserData(email: string, role: 'user' | 'company'): void {
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', role);
  }

  private navigateToOTPVerification(
    userEmail: string,
    userRole: 'user' | 'company'
  ): void {
    this.router.navigate(['auth/OTP-verification'], {
      state: {
        userEmail: userEmail,
        userRole: userRole,
      },
    });
  }

  private handleRegistrationError(message?: string): void {
    console.error('Registration failed:', message);
  }

  handleSignupError(error: any, role: 'user' | 'company'): void {
    const errorMessage =
      role === 'company'
        ? 'Company registration error:'
        : 'User registration error:';
    console.error(errorMessage, error);
  }
}
