import { Component } from '@angular/core';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { AuthService } from '../../../services/auth/auth.service';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store/app.state';
import { logoutRequest } from '../../../store/auth/auth.actions';
import { selectIsLoggedIn } from '../../../store/auth/auth.selectors';
@Component({
  selector: 'app-user-landing-page',
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './user-landing-page.component.html',
  styleUrl: './user-landing-page.component.css',
})
export class UserLandingPageComponent {
  isLoggedIn;
  constructor(
    private _authService: AuthService,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private store: Store<AppState>
  ) {
    this.isLoggedIn = this.store.select(selectIsLoggedIn);
  }
  userRole = 'user';

  handleLogout() {
    this.store.dispatch(logoutRequest({ role: 'user' }));
  }
}
