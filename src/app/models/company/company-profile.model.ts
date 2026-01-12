import { IDocuments, IPublicFileAsset } from '../user/user-profile.model';

export class IAddress {
  city!: string;
  state!: string;
  country!: string;
  postalCode!: string;
}

export interface IProfilePicture {
  key: string;
  location: string;
}
export interface IBannerImage {
  key: string;
  location: string;
}

export interface CompanyProfile {
   _id: string;
  name: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  bannerImage?: string;
  provider: 'google' | 'local';
  role: 'company';
  isBlocked: boolean;
  isVerified: boolean;
  website?: string;
  location?: string;
  industry?: string;
  GSTIN?: string;
  address?: IAddress[];
  description?: string;
  numberOfEmployees?: number;
  documents: IDocuments[];
  subscriptionStatus?: 'active' | 'expired' | 'pending';
  subscriptionStart?: Date;
  subscriptionEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BasicCompanyUpdate {
  name: string;
  phone?: string;
  website?: string;
  location?: string;
  industry?: string;
  address?: IAddress[];
  GSTIN?: string;
  description?: string;
}

export interface ICompanyListItem {
  _id: string;

  name: string;
  email: string;
  phone?: string;

  provider: 'local' | 'google';
  role: 'company';

  isBlocked: boolean;
  isVerified: boolean;

  industry?: string;
  location?: string;

  profilePicture?: IPublicFileAsset;
  bannerImage?: IPublicFileAsset;

  subscriptionStatus: 'active' | 'expired' | 'pending';

  createdAt: string;
  updatedAt: string;
}
