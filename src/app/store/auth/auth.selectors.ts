import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from '../../models/auth.model';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectIsLoggedIn = createSelector(
  selectAuthState,
  (state) => state.isLoggedIn
);

export const selectUser = createSelector(
  selectAuthState,
  (state) => state.user
);

export const selectUserRole = createSelector(
  selectAuthState,
  (state) => state.user?.role
);

export const selectError = createSelector(
  selectAuthState,
  (state) => state.error
);
