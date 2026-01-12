// src/app/services/signup-service.handler.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { IRegisterData } from '../models/auth.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiResponse } from '../models/api-response.model';
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
    private router: Router,
    private _snackBar: MatSnackBar
  ) {}

  handleSignup(
    formData: IRegisterData
  ): Observable<ApiResponse<{ email: string; role: string }>> {
    return this.signupAuthService.requestOTP(formData);
  }

  handleOTPResponse(
    response: ApiResponse<{ email: string; role: string }>,
    email: string,
    role: string
  ): void {
    if (response.success) {
      if (response.data) {
        this.storeUserData(response.data.email, response.data.role);
        this._snackBar.open('An OTP has been sent to your email', 'close', {
          duration: 2000,
        });
        setTimeout(() => {
          this.navigateToOTPVerification(email, role);
        }, 2000);
      }
    } else {
      this.handleRegistrationError(response.message);
    }
  }

  private storeUserData(email: string, role: string): void {
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', role);
  }

  private navigateToOTPVerification(userEmail: string, userRole: string): void {
    this.router.navigate(['auth/OTP-verification'], {
      state: {
        userEmail: userEmail,
        userRole: userRole,
      },
    });
  }

  private handleRegistrationError(message?: string): void {
    this._snackBar.open(`${message}`, 'close', { duration: 2000 });
  }

  handleSignupError(error: any, role: 'user' | 'company'): void {
    const errorMessage =
      role === 'company'
        ? 'Company registration error:'
        : 'User registration error:';
    console.error(errorMessage, error);
  }
}
