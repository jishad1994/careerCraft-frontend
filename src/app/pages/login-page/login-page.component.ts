import { Component, OnDestroy } from '@angular/core';
import { LoginComponent } from '../../shared/components/login/login.component';
import { environment } from '../../environments/environment';
import { AuthService } from '../../services/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { GoogleAuthService } from '../../services/google-auth-service/google-auth.service';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { AuthState } from '../../models/auth.model';
import { AppState } from '../../store/app.state';

declare const google: any;
@Component({
  selector: 'app-login-page',
  imports: [LoginComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent implements OnDestroy {
  logoUrl: string = environment.logUrl;

  private _clientId = environment.GOOGLE_CLIENT_ID;
  destroy$ = new Subject<void>();
  roleRoutes: Record<string, string> = {
    user: '/user/home',
    company: '/company/home',
    admin: '/admin/dashboard',
  };

  constructor(
    private _authService: AuthService,
    private _snackBar: MatSnackBar,
    private _router: Router,
    private _googleAuth: GoogleAuthService,
    private store: Store<AppState>
  ) {}

  loading: boolean = false;
  handleLogin(payload: { role: string; email: string; password: string }) {
    this.loading = true;

    // this.store.dispatch(loginRequest(payload));
    this._authService
      .login(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this._snackBar.open('Login Successfull', 'close', {
              duration: 2000,
            });

            const path =
              this.roleRoutes[res.data?.user['role']] || '/auth/login';
            this._router.navigate([path]);
          }
        },
        error: (error) => {
          this._snackBar.open('Login Failed', 'close', { duration: 2000 });
        },
      });
  }

  initGoogleLogin(event: { role: 'user' | 'company'; elementId: string }) {
    google.accounts.id.initialize({
      client_id: this._clientId,
      callback: (response: any) => {
        const credential = response.credential;
        // this.store.dispatch(
        //   googleLoginRequest({ credential, role: event.role })
        // );

        this._googleAuth
          .handleCredentialResponse(credential, event.role)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (res) => {
              if (res.success) {
                this._snackBar.open('Login Successfull', 'close', {
                  duration: 2000,
                });

                const path = this.roleRoutes[res.user?.role] || '/auth/login';
                this._router.navigate([path]);
              }
            },
            error: (error) => {
              this._snackBar.open('Login Failed', 'close', { duration: 2000 });
            },
          });
      },
      auto_select: false,
      ux_mode: 'popup',
    });

    google.accounts.id.renderButton(document.getElementById(event.elementId), {
      theme: 'outline',
      size: 'large',
      width: 500,
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
