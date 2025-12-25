import { Routes } from '@angular/router';
import { UserLandingPageComponent } from '../pages/user/user-landing-page/user-landing-page.component';
import { AuthGuard } from '../route-guards/auth.guard';
import { MainLayoutComponent } from '../layouts/main-layout/main-layout.component';
import { UserProfileComponent } from '../features/user/user-profile/user-profile.component';

export const USER_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,

    children: [
      { path: '', redirectTo: '/home', pathMatch: 'full' },
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
