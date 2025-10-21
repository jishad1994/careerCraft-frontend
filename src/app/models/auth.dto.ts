import { AuthUser } from "../store/auth/auth.model";

export interface LoginResponseUserDTO {
  id: string;
  email: string;
  role: 'user' | 'company';
  name?: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
}

export interface LoginResponseDTO {
  success: boolean;
  message: string;
  user: AuthUser;
  accessToken?: string;
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
