import { createReducer, on } from '@ngrx/store';
import { AuthState } from '../../models/auth.model';
import {
  loginRequest,
  loginSuccess,
  loginFailure,
  logoutRequest,
  loadUserSuccess,
  loadUserFailure,
  googleLoginRequest,
  googleLoginSuccess,
  googleLoginFailure,
  logoutSuccess,
  logoutFailure,
} from './auth.actions';

export const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  loading: false,
  error: null,
};

export const authReducer = createReducer(
  initialState,
  on(loginRequest, (state) => ({ ...state, loading: true, error: null })),

  on(loginSuccess, (state, { user }) => ({
    ...state,
    isLoggedIn: true,
    user,
    loading: false,
  })),

  on(loginFailure, (state, { error }) => ({ ...state, error, loading: false })),
  on(logoutRequest, (state) => ({ ...state, loading: true, error: null })),
  on(logoutSuccess, () => initialState),
  on(logoutFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  //google login reducers
  on(googleLoginRequest, (state) => ({ ...state, loading: true, error: null })),
  on(googleLoginSuccess, (state, { user }) => ({
    ...state,
    user,
    loading: false,
    error: null,
  })),
  on(googleLoginFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  //laod user
  on(loadUserSuccess, (state, { user }) => ({
    ...state,
    isLoggedIn: true,
    user,
  })),
  on(loadUserFailure, () => initialState)
);
