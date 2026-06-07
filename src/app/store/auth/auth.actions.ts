import { createAction, props } from '@ngrx/store';
import { AuthResponseUserDTO } from '../../models/auth.dto';

//normal login actions
export const loginRequest = createAction(
  '[Auth] Login Request',
  props<{ email: string; password: string; role: string }>()
);
export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: AuthResponseUserDTO }>()
);

//google login actions

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

export const googleLoginRequest = createAction(
  '[Auth] google login request',
  props<{ credential: google.accounts.id.CredentialResponse; role: 'user' | 'company' }>()
);

export const googleLoginFailure = createAction(
  '[Auth] google login failure',
  props<{ error: string }>()
);

export const googleLoginSuccess = createAction(
  '[Auth] google login success',
  props<{ user: AuthResponseUserDTO }>()
);


// logout actions
export const logoutRequest = createAction(

  
  '[Auth] Logout request',
  props<{ role: 'user' | 'company' }>()
);

export const logoutSuccess = createAction('[Auth] logout success');
export const logoutFailure = createAction(
  '[Auth] logout failure',
  props<{ error: string }>()
);

//for loading user agian after refresh

export const loadUserRequest = createAction('[Auth] Load User Request');

export const loadUserSuccess = createAction(
  '[Auth] Load User Success',
  props<{ user: AuthResponseUserDTO }>()
);

export const loadUserFailure = createAction(
  '[Auth] Load User Failure',
  props<{ error: string }>()
);
