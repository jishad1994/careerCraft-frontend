import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SignupAuthService } from '../../../services/signup-auth/signup-auth.service';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  loading: boolean = false;

  constructor(
    private FB: FormBuilder,
    private snackBar: MatSnackBar,
    private authServie: SignupAuthService,
    private router: Router
  ) {
    this.loginForm = this.FB.group({
      role: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$'),
        ],
      ],
    });
  }

  submit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      console.log('Invalid login credentials');
      this.snackBar.open('Please fix the errors before submitting.', 'Close', {
        duration: 3000,
        panelClass: ['bg-red-500', 'text-white'],
      });
      return;
    }

    this.loading = true;

    this.authServie.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.loading = false;

        //set accesstoken inside localstorge
        localStorage.setItem('accesstoken', res.accesstoken);
        this.snackBar.open('Login successful!', 'Close', {
          duration: 3000,
          panelClass: ['bg-green-600', 'text-white'],
        });

        const role = this.loginForm.value.role;
        if (role === 'user') {
          this.router.navigate(['/user/dashboard']);
        } else if (role === 'company') {
          this.router.navigate(['/company/dashboard']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.error?.message || 'Login Faild', 'close', {
          duration: 3000,
          panelClass: ['bg-red-500', 'text-white'],
        });
      },
    });
  }

  get email() {
    return this.loginForm.get('email')!;
  }

  get password() {
    return this.loginForm.get('password')!;
  }
}
