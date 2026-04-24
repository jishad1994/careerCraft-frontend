import { AuthResponseUserDTO } from './auth.dto';

export interface AuthUser extends AuthResponseUserDTO {}

export interface AuthState {
  isLoggedIn: boolean;
  user: AuthResponseUserDTO | null;
  loading: boolean;
  error: string | null;
}
