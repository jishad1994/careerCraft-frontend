import { AuthUser } from './auth.model';
import { IPublicFileAsset } from './user/user-profile.model';

export interface AuthResponseUserDTO {
  id: string;
  email: string;
  role: 'user' | 'company';
  name?: string;
  firstName?: string;
  lastName?: string;
  profilePicture?:IPublicFileAsset;
}

export interface LoginResponseDTO {
  success: boolean;
  message: string;
  data: { user: AuthResponseUserDTO };
  accessToken?: string;
}
export interface RefreshTokenResponseDTO {
  success: boolean;
  message: string;
  data: AuthResponseUserDTO;
}

export interface LogoutResponseDTO {
  success: boolean;
  message: string;
}

export interface LoginRequestDTO {
  email: string;
  password: string;
  role: string;
}

export interface OtpRequestUserDataDTO {
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  password: string;
}

export interface SignupRequestDTO {
  email: string;
  role: string;
}
