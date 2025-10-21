import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { AuthService } from '../../../services/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-company-landing-page',
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './company-landing-page.component.html',
  styleUrl: './company-landing-page.component.css',
})
export class CompanyLandingPageComponent implements OnInit {
  constructor(
    private _authService: AuthService,
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
          localStorage.removeItem('user');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('accessToken');
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
    console.log('user',user)
    user ? (this.isLoggedIn = true) : (this.isLoggedIn = false);
    this.userRole = localStorage.getItem('userRole');
  }
}
