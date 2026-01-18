import { IPublicFileAsset } from "./user/user-profile.model";

export interface AuthUser {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: 'user' | 'company';
  profilePicture?: IPublicFileAsset;
}

export interface AuthState {
  isLoggedIn: boolean;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}
