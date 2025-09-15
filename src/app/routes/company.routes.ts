import { Routes } from '@angular/router';
import { CompanyLandingPageComponent } from '../pages/company/company-landing-page/company-landing-page.component';
import { AuthGuard } from '../route-guards/auth.guard';
import { RoleGuard } from '../route-guards/role.guard';

export const COMPANY_ROUTES: Routes = [
  {
    path: 'home',
    component: CompanyLandingPageComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'company' },
  },
];
