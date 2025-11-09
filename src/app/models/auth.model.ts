export interface AuthUser {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: 'user' | 'company';
  profilePicture?: string;
}

export interface AuthState {
  isLoggedIn: boolean;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}
