import { Component } from '@angular/core';
import { LoginComponent } from '../../shared/components/login/login.component';
import { environment } from '../../environments/environment';
@Component({
  selector: 'app-login-page',
  imports: [LoginComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent {
  logoUrl: string = environment.logUrl;
}
