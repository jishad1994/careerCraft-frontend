import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthState, } from '../../models/auth.model';
import { AuthResponseUserDTO } from '../../models/auth.dto';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
 

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

  login(user: AuthResponseUserDTO) {
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

  updateUser(userData: Partial<AuthResponseUserDTO>): void {
    const updatedUser = { ...this.authState.user, ...userData } as AuthResponseUserDTO;
    this.updateState({ ...this.authState, user: updatedUser });
  }
}
