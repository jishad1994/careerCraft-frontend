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

import { otpPattern } from '../../../constants/form.constants';
import { Router } from '@angular/router';
import { FormValidators } from '../../../validators/form.validators';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-otp-verification',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './otp-verification.component.html',
  styleUrl: './otp-verification.component.css',
})
export class OtpVerificationComponent implements OnInit {
  //user email
  email: string = '';

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
    private authService: AuthService
  ) {
    this.otpForm = this.FB.group({
      otp: ['', [Validators.required, Validators.pattern(otpPattern)]],
    });
  }

  ngOnInit(): void {
    let navState = history.state;
    this.email = navState.userEmail;

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
  }

  //verify OTP

  verifyOTP() {
    if (this.otpForm.invalid) {
      console.log('invalid OTP enterd');
    } else {
      //get the OTP from the form
      const otp = this.otpForm.get('otp')?.value;
      //get the user email from the local storage

      const email = localStorage.getItem('userEmail') || ' ';
      this.authService.verifyOTP({ otp, email }).subscribe((res) => {
        if (res.status) {
          //keep the email in the local storage for a while

          console.log(res.message);
        } else {
          console.log(res.message);
        }
      });
    }
  }
}
