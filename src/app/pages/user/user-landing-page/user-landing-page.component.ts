import { Component } from '@angular/core';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SignupAuthService } from '../../../services/signup-auth/signup-auth.service';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
@Component({
  selector: 'app-user-landing-page',
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './user-landing-page.component.html',
  styleUrl: './user-landing-page.component.css',
})
export class UserLandingPageComponent {
  constructor(
    private _authService: SignupAuthService,
    private _snackbar: MatSnackBar,
    private _router: Router
  ) {}
  isLoggedIn: boolean = false;
  userRole: string | null = 'user';

  handleLogout() {
    this._authService.logout(this.userRole!).subscribe({
      next: (res) => {
        if (res.success) {
          this._snackbar.open('logout successfull', 'close', {
            duration: 2000,
          });
         localStorage.clear()
          this._router.navigate(['/auth/login']);
        }
      },
      error: (error) => {
        this._snackbar.open('some error occured', 'close', {
          duration: 2000,
        });
      },
    });
  }

  handleSearch(event: string) {}

  ngOnInit(): void {
    let user = JSON.parse(localStorage.getItem('user') || '');
    user ? (this.isLoggedIn = true) : (this.isLoggedIn = false);
    this.userRole = localStorage.getItem('userRole');
  }
}
