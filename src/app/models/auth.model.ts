import { AuthResponseUserDTO } from './auth.dto';
import { IPublicFileAsset } from './user/user-profile.model';

export interface AuthUser extends AuthResponseUserDTO {}

export interface AuthState {
  isLoggedIn: boolean;
  user: AuthResponseUserDTO | null;
  loading: boolean;
  error: string | null;
}
