import { Routes } from '@angular/router';
import { CompanyLandingPageComponent } from '../pages/company/company-landing-page/company-landing-page.component';
import { AuthGuard } from '../route-guards/auth.guard';
import { RoleGuard } from '../route-guards/role.guard';
import { MainLayoutComponent } from '../layouts/main-layout/main-layout.component';
import { UserLandingPageComponent } from '../pages/user/user-landing-page/user-landing-page.component';

export const COMPANY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../layouts/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import(
            '../pages/company/company-landing-page/company-landing-page.component'
          ).then((m) => m.CompanyLandingPageComponent),
      },
    ],
  },
];
