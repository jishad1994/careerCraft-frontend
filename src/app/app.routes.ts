import { Routes } from '@angular/router';
import { SignupPageComponent } from './pages/signup-page/signup-page.component';
import { LoginComponent } from './shared/components/login/login.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { OtpVerificationPageComponent } from './pages/otp-verification-page/otp-verification-page.component';
import { UserLandingPageComponent } from './pages/user/user-landing-page/user-landing-page.component';
import { CompanyLandingPageComponent } from './pages/company/company-landing-page/company-landing-page.component';
import { ForgotPasswordComponent } from './shared/components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './shared/components/reset-password/reset-password.component';

export const routes: Routes = [
  { path: 'auth/signup', component: SignupPageComponent },
  { path: 'auth/login', component: LoginPageComponent },
  { path: 'auth/OTP-verification', component: OtpVerificationPageComponent },
  { path: 'user/home', component: UserLandingPageComponent },
  { path: 'auth/forgotPassword', component: ForgotPasswordComponent },
  { path: 'auth/resetPassword', component: ResetPasswordComponent },
  { path: 'company/home', component: CompanyLandingPageComponent },
];
