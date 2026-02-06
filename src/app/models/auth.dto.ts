import { IPublicFileAsset } from './user/user-profile.model';

export interface AuthResponseUserDTO {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: 'user' | 'company'|'admin';
  profilePicture?:IPublicFileAsset;
}

export interface ILoginCredentials {
  email: string;
  password: string;
  role: string;
}




