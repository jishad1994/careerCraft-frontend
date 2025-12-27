import { Routes } from '@angular/router';


export const USER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../layouts/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),

    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () =>
          import(
            '../pages/user/user-landing-page/user-landing-page.component'
          ).then((m) => m.UserLandingPageComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('../features/user/user-profile/user-profile.component').then(
            (m) => m.UserProfileComponent
          ),
      },

      { path: '**', redirectTo: 'home' },
    ],
  },
];
