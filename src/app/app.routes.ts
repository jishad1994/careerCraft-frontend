import { Routes } from '@angular/router';
import { SignupPageComponent } from './pages/signup-page/signup-page.component';
import { LoginComponent } from './shared/components/login/login.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { OtpVerificationComponent } from './shared/components/otp-verification/otp-verification.component';
import { OtpVerificationPageComponent } from './pages/otp-verification-page/otp-verification-page.component';
import { UserLandingPageComponent } from './pages/user/user-landing-page/user-landing-page.component';
import { CompanyLandingPageComponent } from './pages/company/company-landing-page/company-landing-page.component';

export const routes: Routes = [
  { path: 'user/signup', component: SignupPageComponent },
  { path: 'user/login', component: LoginPageComponent },
  { path: 'user/OTP-verification', component: OtpVerificationPageComponent },
  { path: 'user/home', component: UserLandingPageComponent },
  { path: 'company/home', component: CompanyLandingPageComponent },
];
