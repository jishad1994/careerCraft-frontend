import { Routes } from '@angular/router';
import { UserLandingPageComponent } from '../pages/user/user-landing-page/user-landing-page.component';
import { AuthGuard } from '../route-guards/auth.guard';

export const USER_ROUTES: Routes = [
  {
    path: 'home',
    component: UserLandingPageComponent,
  },
];
