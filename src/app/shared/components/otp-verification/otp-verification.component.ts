import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { OTP_PATTERN } from '../../../constants/form.constants';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-otp-verification',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './otp-verification.component.html',
  styleUrl: './otp-verification.component.css',
})
export class OtpVerificationComponent implements OnInit,OnDestroy {
  private FB = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private _snackBar = inject(MatSnackBar);

  //user email
  email = '';
  role = '';

  //resend OTP timer variables
  resendDisabled = true;
  timer = 60;
  intervalId!: ReturnType<typeof setInterval>;

  logoUrl: string = environment.logUrl;

  //OTP form
  otpForm: FormGroup;

  //constructor
  constructor() {
    this.otpForm = this.FB.group({
      otp: ['', [Validators.required, Validators.pattern(OTP_PATTERN)]],
    });
  }

  ngOnInit(): void {
    const navState = history.state;
    this.email = navState.userEmail || localStorage.getItem('userEmail');
    this.role =
      navState.userRole || (localStorage.getItem('userRole') as string);

    this.startResendTimer();
  }

  ngOnDestroy(): void {
  if (this.intervalId) {
    clearInterval(this.intervalId);
  }
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

    this.authService.resendOTP(this.email, this.role).subscribe({
      next: (res) => console.log(res),
      error: (err) => console.log(err),
    });
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

    this.authService.verifyOTP(otp, this.email, this.role).subscribe({
      next: (res) => {
        this._snackBar.open('OTP verified successfully', 'close', {
          duration: 3000,
        });

        if (res.data) {
          this.authService.userSignup(res.data.email, res.data.role).subscribe({
            next: (signupRes) => {
              if (signupRes.success) {
                this._snackBar.open('Signup successful!', 'close', {
                  duration: 6000,
                });

                this.router.navigate(['auth/login']);
              }
            },
            error: (err) => {
              this._snackBar.open(
                err.message || 'Otp verification failed',
                'Close',
                {
                  duration: 3000,
                }
              );
            },
          });
        }
      },
      error: (err) => {
        this._snackBar.open(`OTP Verification failed`, 'Close', {
          duration: 3000,
        });
      },
    });
  }
}
