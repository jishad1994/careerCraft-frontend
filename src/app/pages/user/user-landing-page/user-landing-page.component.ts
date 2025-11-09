import { Component, OnDestroy, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { AuthService } from '../../../services/auth/auth.service';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store/app.state';
import { logoutRequest } from '../../../store/auth/auth.actions';
import { selectIsLoggedIn } from '../../../store/auth/auth.selectors';
import { AuthStateService } from '../../../services/authState/auth-state.service';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
@Component({
  selector: 'app-user-landing-page',
  imports: [],
  templateUrl: './user-landing-page.component.html',
  styleUrl: './user-landing-page.component.css',
})
export class UserLandingPageComponent implements OnInit, OnDestroy {
  isLoggedIn$;
  destroy$ = new Subject<void>();
  constructor(
    private _authService: AuthService,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private store: Store<AppState>,
    private _authState: AuthStateService
  ) {
    this.isLoggedIn$ = this._authState.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((authstate) => authstate.isLoggedIn);
  }

  ngOnInit(): void {}

  

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
