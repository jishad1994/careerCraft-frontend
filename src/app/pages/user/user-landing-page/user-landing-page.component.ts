import { Component } from '@angular/core';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  selector: 'app-user-landing-page',
  imports: [HeaderComponent],
  templateUrl: './user-landing-page.component.html',
  styleUrl: './user-landing-page.component.css',
})
export class UserLandingPageComponent {
  constructor() {}
  isLoggedIn: boolean = false;
  userRole: 'user' | 'company' | null = 'user';

  handleLogout() {}

  handleSearch(event: string) {}
}
