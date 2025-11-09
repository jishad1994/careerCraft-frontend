import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import {
  BehaviorSubject,
  catchError,
  Observable,
  retry,
  tap,
  throwError,
} from 'rxjs';
import { IRegisterData } from '../../models/auth.interface';
import { API_ENDPOINTS } from '../../constants/api-endpoints.constants';
import {
  LoginRequestDTO,
  LoginResponseDTO,
  LogoutResponseDTO,
  OtpRequestUserDataDTO,
  RefreshTokenResponseDTO,
  SignupRequestDTO,
} from '../../models/auth.dto';
import { AuthUser } from '../../models/auth.model';
import { AuthStateService } from '../authState/auth-state.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private _http: HttpClient,
    private _authStateService: AuthStateService,
    private _router: Router
  ) {}

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

  //refresh

  refresh() {
    return this._http
      .get<RefreshTokenResponseDTO>(API_ENDPOINTS.AUTH.REFRESH())
      .pipe(
        tap((response) => {
          this._authStateService.updateState({
            isLoggedIn: true,
            user: response.data?.user || null,
            error: null,
            loading: false,
          });
        }),
        catchError((errror) => {
          this._authStateService.updateState({
            isLoggedIn: false,
            user: null,
            error: 'Session expired, please login again',
            loading: false,
          });

          return throwError(() => errror);
        })
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
          if (response.success) {
            this._authStateService.login(response.data?.user);
          }
        }),
        catchError((error) => {
          this._authStateService.logout();
          console.log('login api error: ', error);
          return throwError(() => error);
        })
      );
  }

  //logout
  logout(): Observable<any> {
    return this._http
      .post<LogoutResponseDTO>(
        API_ENDPOINTS.AUTH.LOGOUT(),
        {},
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap((response: LogoutResponseDTO) => {
          if (response.success) {
            localStorage.clear();
            this._authStateService.logout();
            this._router.navigate(['/home']);
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
    return this._http.post(
      API_ENDPOINTS.AUTH.RESEND_OTP(payload.role),
      payload
    );
  }

  //verify OTP
  verifyOTP(payload: {
    otp: string;
    email: string;
    role: string;
  }): Observable<any> {
    return this._http.post(
      API_ENDPOINTS.AUTH.VERIFY_OTP(payload.role),
      payload
    );
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
