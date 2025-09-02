import { Component } from '@angular/core';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  selector: 'app-company-landing-page',
  imports: [HeaderComponent],
  templateUrl: './company-landing-page.component.html',
  styleUrl: './company-landing-page.component.css',
})
export class CompanyLandingPageComponent {
  constructor() {}
  isLoggedIn: boolean = false;
  userRole: 'user' | 'company' | null = 'user';

  handleLogout() {}

  handleSearch(event: string) {}
}
