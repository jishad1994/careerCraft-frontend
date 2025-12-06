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
      { path: 'home', component: UserLandingPageComponent },
      { path: 'profile', component: UserProfileComponent },

      { path: '**', redirectTo: 'home' },
    ],
  },
];
