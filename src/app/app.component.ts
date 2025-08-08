import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SignupComponent } from './shared/components/signup/signup.component';
import { SignupPageComponent } from './pages/signup-page/signup-page.component';
import { LoginComponent } from './shared/components/login/login.component';
import { LoginPageComponent } from "./pages/login-page/login-page.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SignupPageComponent, LoginPageComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'frontend';
}
