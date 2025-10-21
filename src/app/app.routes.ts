import { Routes } from '@angular/router';
import { SignupPageComponent } from './pages/signup-page/signup-page.component';
import { LoginComponent } from './shared/components/login/login.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { OtpVerificationPageComponent } from './pages/otp-verification-page/otp-verification-page.component';
import { UserLandingPageComponent } from './pages/user/user-landing-page/user-landing-page.component';
import { CompanyLandingPageComponent } from './pages/company/company-landing-page/company-landing-page.component';
import { ForgotPasswordComponent } from './shared/components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './shared/components/reset-password/reset-password.component';
import { AdminDashboardComponent } from './pages/admin/admin-dahboard/admin-dashboard.component';
import { UserTableComponent } from './features/admin/user-table/user-table.component';
import { CompaniesTableComponent } from './features/admin/companies-table/companies-table.component';
import { OTPGuard } from './route-guards/otp.guard';
import { RoleGuard } from './route-guards/role.guard';
import { AuthGuard } from './route-guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./routes/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'user',
    loadChildren: () =>
      import('./routes/user.routes').then((m) => m.USER_ROUTES),
  },
  {
    path: 'company',
    loadChildren: () =>
      import('./routes/company.routes').then((m) => m.COMPANY_ROUTES),
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./routes/admin.routes').then((m) => m.ADMIN_ROUTES),   
  },
];
