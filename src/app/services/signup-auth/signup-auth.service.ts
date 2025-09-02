import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
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
      `${this.baseUrl}/api/auth/${role}/check-phoneOrEmailExists`,
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
      `${this.baseUrl}/api/auth/${payload.role}/request-OTP`,
      payload
    );
  }

  resendOTP(payload: { email: string; role: string }): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/auth/${payload.role}/resend-OTP`,
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
      `${this.baseUrl}/api/auth/${payload.role}/verify-OTP`,
      payload
    );
  }
}
