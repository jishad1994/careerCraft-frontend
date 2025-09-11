import { Component } from '@angular/core';
import { SignupComponent } from '../../shared/components/signup/signup.component';
import { GoogleAuthService } from '../../services/google-auth-service/google-auth.service';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [SignupComponent],
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.css'],
})
export class SignupPageComponent {
  constructor(private _googleAuth: GoogleAuthService) {}

  onGoogleSignup(event: { role: 'user' | 'company'; elementId: string }) {
console.log('on google signup function worked')
    this._googleAuth.initGoogle(event.elementId, event.role);
  }
}


