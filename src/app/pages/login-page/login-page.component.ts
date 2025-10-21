import { Component, OnDestroy } from '@angular/core';
import { LoginComponent } from '../../shared/components/login/login.component';
import { environment } from '../../environments/environment';
import { AuthService } from '../../services/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { GoogleAuthService } from '../../services/google-auth-service/google-auth.service';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { AuthState } from '../../store/auth/auth.model';
import { AppState } from '../../store/app.state';
import {
  googleLoginRequest,
  loginRequest,
} from '../../store/auth/auth.actions';

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

    this.store.dispatch(loginRequest(payload));
  }

  initGoogleLogin(event: { role: 'user' | 'company'; elementId: string }) {
    google.accounts.id.initialize({
      client_id: this._clientId,
      callback: (response: any) => {
        const credential = response.credential;
        this.store.dispatch(
          googleLoginRequest({ credential, role: event.role })
        );
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
