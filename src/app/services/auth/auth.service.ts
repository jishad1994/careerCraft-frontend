import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, retry, tap } from 'rxjs';
import { IRegisterData } from '../../models/auth.interface';
import { API_ENDPOINTS } from '../../constants/api-endpoints.constants';
import {
  LoginRequestDTO,
  LoginResponseDTO,
  LogoutResponseDTO,
  OtpRequestUserDataDTO,
  SignupRequestDTO,
} from '../../models/auth.dto';
import { saveToStorage } from '../../helpers/auth.service.helpers';
import { AuthUser } from '../../store/auth/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private _http: HttpClient) {}

  private authSubject = new BehaviorSubject('default message');
  messenger$ = this.authSubject.asObservable();

  //base url from environment files
  private baseUrl = environment.apiUrl;

  //check phone number exists
  checkPhoneOrEmailExists(
    phoneOrEmail: string,
    role: string
  ): Observable<{ exists: boolean }> {
    return this._http.post<{ exists: boolean }>(
      API_ENDPOINTS.AUTH.CHECK_PHONE_OR_EMAIL(role),
      { phoneOrEmail, role }
    );
  }

  //Login
  login(payload: {
    email: string;
    password: string;
    role: string;
  }): Observable<LoginResponseDTO> {
    return this._http
      .post<LoginResponseDTO>(API_ENDPOINTS.AUTH.LOGIN(payload.role), payload)
      .pipe(
        tap((response: LoginResponseDTO) => {
          saveToStorage(response); //save access token and user object to local storage
          if (response.success && response.user) {
            this.authSubject.next(JSON.stringify(response.user));
          }
        })
      );
  }

  //logout
  logout(role: string): Observable<any> {
    return this._http
      .post<LogoutResponseDTO>(
        API_ENDPOINTS.AUTH.LOGOUT(role),
        {},
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap((response: LogoutResponseDTO) => {
          if (response.success) {
            localStorage.clear();
          }
        })
      );
  }

  //user register
  userSignup(email: string, role: string): Observable<any> {
    return this._http.post<SignupRequestDTO>(API_ENDPOINTS.AUTH.SIGNUP(role), {
      email,
      role,
    });
  }

  //request OTP
  requestOTP(payload: IRegisterData): Observable<any> {
    return this._http.post<OtpRequestUserDataDTO>(
      API_ENDPOINTS.AUTH.REQUEST_OTP(payload.role),
      payload
    );
  }

  resendOTP(payload: { email: string; role: string }): Observable<any> {
    return this._http.post(API_ENDPOINTS.AUTH.RESEND_OTP(payload.role), payload);
  }

  //verify OTP
  verifyOTP(payload: {
    otp: string;
    email: string;
    role: string;
  }): Observable<any> {
    return this._http.post(API_ENDPOINTS.AUTH.VERIFY_OTP(payload.role), payload);
  }

  //forgot password

  forgotPassword(payload: {
    email: string;
    role: 'user' | 'company';
  }): Observable<any> {
    return this._http.post(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD(payload.role),
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
    return this._http.post(API_ENDPOINTS.AUTH.RESET_PASSWORD(role), payload);
  }
}
