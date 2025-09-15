import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, retry } from 'rxjs';
import { IRegisterData } from '../../models/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class SignupAuthService {
  constructor(private http: HttpClient) {}

  //base url from environment files
  private baseUrl = environment.apiUrl;

  //check phone number exists
  checkPhoneOrEmailExists(
    phoneOrEmail: string,
    role: string
  ): Observable<{ exists: boolean }> {
    return this.http.post<{ exists: boolean }>(
      `${this.baseUrl}/api/auth/${role}/check-availability`,
      { phoneOrEmail, role }
    );
  }

  //user login
  login(payload: {
    email: string;
    password: string;
    role: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/auth/${payload.role}/login`, {
      payload,
    });
  }

  logout(role: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/auth/${role}/logout`, {
      withCredentials: true,
    });
  }

  //user register
  userSignup(email: string, role: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/auth/${role}/signup`, {
      email,
      role,
    });
  }

  //request OTP
  requestOTP(payload: IRegisterData): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/auth/${payload.role}/otp/request`,
      payload
    );
  }

  resendOTP(payload: { email: string; role: string }): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/auth/${payload.role}/otp/resend`,
      payload
    );
  }

  //verify OTP
  verifyOTP(payload: {
    otp: string;
    email: string;
    role: string;
  }): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/auth/${payload.role}/otp/verify`,
      payload
    );
  }

  //forgot password

  forgotPassword(payload: {
    email: string;
    role: 'user' | 'company';
  }): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/auth/${payload.role}/forgotPassword`,
      payload
    );
  }

  //reset password

  resetPassword(
    payload: {
      newPassword: string;
      resetPasswordToken: string;
    },
    role: string
  ): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/auth/${role}/resetPassword`,
      payload
    );
  }
}
