import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, Subject, take, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthStateService } from '../../../services/authState/auth-state.service';
import { AuthService } from '../../../services/auth/auth.service';
@Component({
  selector: 'app-header',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit, OnDestroy {
  //observables
  destroy$ = new Subject<void>();
  isLoggedIn$;
  role$;
  isDropdownOpen = false;

  constructor(
    private store: Store,
    private _snackBar: MatSnackBar,
    private _authStateService: AuthStateService,
    private _authService: AuthService,
    private _router: Router
  ) {
    this.isLoggedIn$ = this._authStateService.authState$.pipe(
      map((authState) => authState.isLoggedIn)
    );

    this.role$ = this._authStateService.authState$.pipe(
      map((authState) => authState.user?.role)
    );
  }

  logoUrl = environment.logUrl;
  @Output() search = new EventEmitter<string>();

  searchQuery = '';

  onSearch() {
    this.search.emit(this.searchQuery);
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;

    if (!target.closest('.dropdown-container')) {
      this.isDropdownOpen = false;
    }
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  ngOnInit(): void {
    this._authService.refresh().pipe(takeUntil(this.destroy$)).subscribe();
  }

  onLogout() {
    this._authService
      .logout()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this._snackBar.open('Logout successfull', 'close', {
              duration: 2000,
            });
          }
        },
        error: (error) => {
          this._snackBar.open('Logout failed', 'close', {
            duration: 2000,
          });
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
