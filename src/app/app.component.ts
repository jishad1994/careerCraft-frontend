import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SignupComponent } from './shared/components/signup/signup.component';
import { SignupPageComponent } from './pages/signup-page/signup-page.component';
import { LoginComponent } from './shared/components/login/login.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'frontend';

  constructor(private _router: Router) {}

  ngOnInit(): void {
    const token = localStorage.getItem('accessToke');
    const user = localStorage.getItem('user');

    if (token && user) {
      const parsedUser = JSON.parse(user);

      if (parsedUser.role == 'user') {
        this._router.navigate(['user/home']);
      } else if (parsedUser.role == 'company') {
        this._router.navigate(['company/home']);
      } else {
        this._router.navigate(['admin/dashboard']);
      }
    }
  }
}
