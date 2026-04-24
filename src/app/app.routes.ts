import { Routes } from '@angular/router';


export const routes: Routes = [
  {
    path: '',

    loadChildren: () =>
      import('../app/routes/public.routes').then((m) => m.publicRoutes),
  },

  {
    path: 'auth',
    loadChildren: () =>
      import('./routes/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'user',
    loadChildren: () =>
      import('./routes/user/parent.routes').then((m) => m.USER_ROUTES),
  },
  {
    path: 'company',
    loadChildren: () =>
      import('./routes/company/parent.routes').then((m) => m.COMPANY_ROUTES),
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./routes/admin.routes').then((m) => m.ADMIN_ROUTES),
  },

  {
    path: 'blocked',
    loadComponent: () =>
      import('../app/shared/components/account-restricted/account-restricted.component').then(
        (m) => m.AccountRestrictedComponent,
      ),
  },
];
