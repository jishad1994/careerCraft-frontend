import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { RouterLink, RouterModule } from '@angular/router';
import { AppState } from '../../../store/app.state';
import { Store } from '@ngrx/store';
import {
  selectIsLoggedIn,
  selectUserRole,
} from '../../../store/auth/auth.selectors';
import { logoutRequest } from '../../../store/auth/auth.actions';
import { take } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-header',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  isLoggedIn$;
  role$;
  constructor(private store: Store, private _snackBar: MatSnackBar) {
    this.isLoggedIn$ = this.store.select(selectIsLoggedIn);
    this.role$ = this.store.select(selectUserRole);
  }
  logoUrl = environment.logUrl;
  @Output() search = new EventEmitter<string>();

  searchQuery = '';

  onSearch() {
    this.search.emit(this.searchQuery);
  }



  onLogout() {
    this.role$.pipe(take(1)).subscribe((role) => {
      if (role) {
        this.store.dispatch(logoutRequest({ role }));
      } else {
        console.warn('Logout skipped: role is undefined');

        this._snackBar.open('cant logout ', 'close', { duration: 3000 });
      }
    });
  }
}
