import { Routes } from '@angular/router';


export const COMPANY_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('../layouts/company/company-layout/company-layout.component').then(
        (m) => m.CompanyLayoutComponent
      ),
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      {
        path: 'profile',
        loadComponent: () =>
          import(
            '../features/company/profile/company-profile-parent/company-profile.component'
          ).then((m) => m.CompanyProfileComponent),
      },
    ],
  },
];
