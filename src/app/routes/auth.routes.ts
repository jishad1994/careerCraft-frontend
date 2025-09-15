import { Routes } from '@angular/router';
import { SignupPageComponent } from '../pages/signup-page/signup-page.component';
import { LoginPageComponent } from '../pages/login-page/login-page.component';
import { OtpVerificationPageComponent } from '../pages/otp-verification-page/otp-verification-page.component';
import { ForgotPasswordComponent } from '../shared/components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from '../shared/components/reset-password/reset-password.component';

export const AUTH_ROUTES: Routes = [
  { path: 'signup', component: SignupPageComponent },
  { path: 'login', component: LoginPageComponent },
  {
    path: 'OTP-verification',
    component: OtpVerificationPageComponent,
  },
  { path: 'forgotPassword', component: ForgotPasswordComponent },
  { path: 'resetPassword', component: ResetPasswordComponent },
];
