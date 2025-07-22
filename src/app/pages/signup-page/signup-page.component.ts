import { Component } from '@angular/core';
import { SignupComponent } from '../../shared/components/signup/signup.component';
import { LoginComponent } from '../../shared/components/login/login.component';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [ SignupComponent],
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.css'],
})
export class SignupPageComponent {}
3