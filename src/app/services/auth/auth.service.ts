import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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
import { AuthResponseUserDTO, ILoginCredentials } from '../../models/auth.dto';
import { AuthStateService } from '../authState/auth-state.service';
import { Router } from '@angular/router';
import { ApiResponse } from '../../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private _http: HttpClient,
    private _authStateService: AuthStateService,
    private _router: Router,
  ) {}

  //base url from environment files
  private baseUrl = environment.apiUrl;

  //check phone number exists
  checkPhoneOrEmailExists(
    phoneOrEmail: string,
    role: string,
  ): Observable<ApiResponse<{ exists: boolean }>> {
    return this._http.post<ApiResponse<{ exists: boolean }>>(
      API_ENDPOINTS.AUTH.CHECK_PHONE_OR_EMAIL(role),
      { phoneOrEmail, role },
    );
  }

  //refresh

  refresh(): Observable<ApiResponse<AuthResponseUserDTO>> {
    return this._http
      .get<
        ApiResponse<AuthResponseUserDTO>
      >(API_ENDPOINTS.AUTH.REFRESH(), { withCredentials: true })
      .pipe(
        tap((response) => {
          this._authStateService.updateState({
            isLoggedIn: true,
            user: response.data || null,
            error: null,
            loading: false,
          });
        }),
        catchError((error) => {
          this._authStateService.updateState({
            isLoggedIn: false,
            user: null,
            error: 'Session expired, please login again',
            loading: false,
          });

          return throwError(() => error);
        }),
      );
  }

  //Login
  login(
    payload: ILoginCredentials,
  ): Observable<ApiResponse<AuthResponseUserDTO>> {
    return this._http
      .post<
        ApiResponse<AuthResponseUserDTO>
      >(API_ENDPOINTS.AUTH.LOGIN(payload.role), payload)
      .pipe(
        tap((response) => {
          if (response.success) {
            if (response.data) {
              this._authStateService.login(response.data);
            }
          }
        }),
        catchError((error) => {
          this._authStateService.logout();
          return throwError(() => error);
        }),
      );
  }

  //logout
  logout(): Observable<ApiResponse<null>> {
    return this._http
      .post<ApiResponse<null>>(
        API_ENDPOINTS.AUTH.LOGOUT(),
        {},
        {
          withCredentials: true,
        },
      )
      .pipe(
        tap((response) => {
          if (response.success) {
            this._authStateService.logout();
          }
        }),
        catchError((error) => {
          console.log(error.message);
          return throwError(error);
        }),
      );
  }

  //user register
  userSignup(
    email: string,
    role: string,
  ): Observable<ApiResponse<{ email: string; role: string }>> {
    const payload = { email, role };
    return this._http.post<ApiResponse<{ email: string; role: string }>>(
      API_ENDPOINTS.AUTH.SIGNUP(role),
      payload,
    );
  }

  //request OTP
  requestOTP(
    payload: IRegisterData,
  ): Observable<ApiResponse<{ email: string; role: string }>> {
    return this._http.post<ApiResponse<{ email: string; role: string }>>(
      API_ENDPOINTS.AUTH.REQUEST_OTP(payload.role),
      payload,
    );
  }

  resendOTP(
    email: string,
    role: string,
  ): Observable<ApiResponse<{ email: string; role: string }>> {
    const payload = { email, role };
    return this._http.post<ApiResponse<{ email: string; role: string }>>(
      API_ENDPOINTS.AUTH.RESEND_OTP(payload.role),
      payload,
    );
  }

  //verify OTP
  verifyOTP(
    otp: string,
    email: string,
    role: string,
  ): Observable<ApiResponse<{ email: string; role: string }>> {
    const payload = { otp, email, role };
    return this._http.post<ApiResponse<{ email: string; role: string }>>(
      API_ENDPOINTS.AUTH.VERIFY_OTP(role),
      payload,
    );
  }

  //forgot password

  forgotPassword(
    email: string,
    role: 'user' | 'company',
  ): Observable<ApiResponse<null>> {
    const payload = { email, role };
    return this._http.post<ApiResponse<null>>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD(payload.role),
      payload,
    );
  }

  //reset password
  resetPassword(
    newPassword: string,
    resetPasswordToken: string,
    role: string,
  ): Observable<ApiResponse<null>> {
    return this._http.post<ApiResponse<null>>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD(role),
      {
        newPassword,
        resetPasswordToken,
      },
    );
  }
}
