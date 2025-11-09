import { Routes } from '@angular/router';
import { UserLandingPageComponent } from '../pages/user/user-landing-page/user-landing-page.component';
import { AuthGuard } from '../route-guards/auth.guard';
import { MainLayoutComponent } from '../layouts/main-layout/main-layout.component';

export const USER_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [{ path: 'home', component: UserLandingPageComponent }],
  },
];
 