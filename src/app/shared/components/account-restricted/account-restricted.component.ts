import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account-restricted',
  imports: [],
  templateUrl: './account-restricted.component.html',
  styleUrl: './account-restricted.component.css'
})
export class AccountRestrictedComponent {
 constructor(private router: Router) {}

  logout() {
  
    localStorage.clear();
    this.router.navigate(['auth/login']);
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}
