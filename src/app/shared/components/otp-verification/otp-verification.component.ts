import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  ValidationErrors,
  AbstractControl,
  FormGroup,
  Validators,
  FormsModule,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { OTP_PATTERN } from '../../../constants/form.constants';
import { Router } from '@angular/router';
import { FormValidators } from '../../../validators/form.validators';
import { SignupAuthService } from '../../../services/signup-auth/signup-auth.service';
@Component({
  selector: 'app-otp-verification',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './otp-verification.component.html',
  styleUrl: './otp-verification.component.css',
})
export class OtpVerificationComponent implements OnInit {
  //user email
  email: string = '';
  role: string = '';

  //resend OTP timer variables
  resendDisabled: boolean = true;
  timer: number = 60;
  intervalId: any;

  //OTP form
  otpForm: FormGroup;

  //constructor
  constructor(
    private FB: FormBuilder,
    private router: Router,
    private authService: SignupAuthService,
    private _snackBar: MatSnackBar
  ) {
    this.otpForm = this.FB.group({
      otp: ['', [Validators.required, Validators.pattern(OTP_PATTERN)]],
    });
  }

  ngOnInit(): void {
    let navState = history.state;
    this.email = navState.userEmail || localStorage.getItem('userEmail');
    this.role =
      navState.userRole || (localStorage.getItem('userRole') as string);

    this.startResendTimer();
  }

  //start or resend timer

  startResendTimer(): void {
    this.resendDisabled = true;
    this.timer = 60;

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(() => {
      this.timer--;
      if (this.timer <= 0) {
        this.resendDisabled = false;
        clearInterval(this.intervalId);
      }
    }, 1000);
  }

  resendOTP() {
    this.startResendTimer();
    console.log('resend otp worked');
    if (this.role == 'user') {
      this.authService
        .resendOTP({ email: this.email, role: this.role })
        .subscribe({
          next: (res) => console.log(res),
          error: (err) => console.log(err),
        });
    }
  }

  //verify OTP

  verifyOTP() {
    if (this.otpForm.invalid) {
      this._snackBar.open('Please enter a valid OTP', 'Close', {
        duration: 3000,
      });
      return;
    }

    const otp = this.otpForm.get('otp')?.value;

    this.authService
      .verifyOTP({ otp, email: this.email, role: this.role })
      .subscribe({
        next: (res) => {
          if (res.success) {
            this._snackBar.open(
              'OTP verified successfully, redirecting...',
              '',
              {
                duration: 3000,
              }
            );
            localStorage.setItem('otpVerified', 'true');

            this.authService.userSignup(res.email, res.role).subscribe({
              next: (signupRes) => {
                if (signupRes.success) {
                  localStorage.setItem('accessToken', signupRes.accessToken);
                  localStorage.setItem('user', JSON.stringify(signupRes.user));
                  this._snackBar.open('Signup successful!', '', {
                    duration: 3000,
                  });
                  this.router.navigate(['user/home']);
                } else {
                  this._snackBar.open(
                    `Signup failed: ${signupRes.message}`,
                    'Close',
                    {
                      duration: 3000,
                    }
                  );
                }
              },
              error: (err) => {
                this._snackBar.open(
                  `Signup error: ${err.error.message}`,
                  'Close',
                  {
                    duration: 3000,
                  }
                );
              },
            });
          } else {
            this._snackBar.open(
              `OTP verification failed`,
              '',
              {
                duration: 3000,
              }
            );
          }
        },
        error: (err) => {
          this._snackBar.open(
            `OTP Verification failed`,
            'Close',
            {
              duration: 3000,
            }
          );
        },
      });
  }
}
