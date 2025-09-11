import { Component } from '@angular/core';
import { LoginComponent } from '../../shared/components/login/login.component';
import { environment } from '../../environments/environment';
import { SignupAuthService } from '../../services/signup-auth/signup-auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { GoogleAuthService } from '../../services/google-auth-service/google-auth.service';
@Component({
  selector: 'app-login-page',
  imports: [LoginComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent {
  logoUrl: string = environment.logUrl;

  constructor(
    private _authService: SignupAuthService,
    private _snackBar: MatSnackBar,
    private _router: Router,
    private _googleAuth: GoogleAuthService
  ) {}

  loading: boolean = false;
  handleLogin(payload: { role: string; email: string; password: string }) {
    console.log(payload, 'payload');

    this.loading = true;
    this._authService.login(payload).subscribe({
      next: (res) => {
        this.loading = false;

        if (res.success) {
          //set accesstoken inside localstorge
          localStorage.setItem('accesstoken', res.accesstoken);
          this._snackBar.open('Login successful!', 'close', {
            duration: 3000,
            panelClass: ['bg-green-600', 'text-white'],
          });

          const role = payload.role;
          if (role === 'user') {
            this._router.navigate(['user/home']);
          } else if (role === 'company') {
            this._router.navigate(['company/home']);
          }
        }
      },

      error: (err) => {
        this.loading = false;
        this._snackBar.open(err.error?.message || 'Login Faild', 'close', {
          duration: 3000,
          panelClass: ['bg-red-500', 'text-white'],
        });
      },
    });
  }

  initGoogleLogin(event: { role: 'user' | 'company'; elementId: string }) {
    this._googleAuth.initGoogle(event.elementId, event.role);
  }
}
