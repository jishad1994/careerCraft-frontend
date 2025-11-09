import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthState, AuthUser } from '../../models/auth.model';
import { TitleStrategy } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  constructor() {}

  private _authState = new BehaviorSubject<AuthState>({
    isLoggedIn: false,
    user: null,
    loading: false,
    error: null,
  });

  authState$ = this._authState.asObservable();

  get authState() {
    return this._authState.value;
  }

  login(user: AuthUser) {
    const newState: AuthState = {
      isLoggedIn: true,
      user,
      loading: false,
      error: null,
    };

    this.updateState(newState);
  }

  logout() {
    const newState: AuthState = {
      isLoggedIn: false,
      user: null,
      loading: false,
      error: null,
    };
    this.updateState(newState);
  }

  updateState(newState: AuthState) {
    this._authState.next(newState);
  }

  updateUser(userData: Partial<AuthUser>): void {
    const updatedUser = { ...this.authState.user, ...userData } as AuthUser;
    this.updateState({ ...this.authState, user: updatedUser });
  }
}
