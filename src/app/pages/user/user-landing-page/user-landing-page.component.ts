import { Component } from '@angular/core';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SignupAuthService } from '../../../services/signup-auth/signup-auth.service';

@Component({
  selector: 'app-user-landing-page',
  imports: [HeaderComponent],
  templateUrl: './user-landing-page.component.html',
  styleUrl: './user-landing-page.component.css',
})
export class UserLandingPageComponent {
  isLoggedIn: boolean = false;
  userRole: 'user' | 'company' | null = 'user';

  constructor(private _authService: SignupAuthService) {}

  handleLogout() {}

  handleSearch(event: string) {}
}
