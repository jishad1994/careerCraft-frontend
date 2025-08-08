import { Routes } from '@angular/router';
import { SignupPageComponent } from './pages/signup-page/signup-page.component';
import { LoginComponent } from './shared/components/login/login.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';

export const routes: Routes = [
  { path: 'user/register', component: SignupPageComponent },
  { path: 'user/login', component: LoginPageComponent },
];
