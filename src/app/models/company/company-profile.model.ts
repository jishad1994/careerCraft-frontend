import { IDocuments, IPublicFileAsset } from '../user-profile.model';

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
  id: string;
  name: string;
  email: string;
  role: 'company';
  phone?: string;
  profilePicture?: IProfilePicture;
  isBlocked: boolean;
  isVerified: boolean;
  documents: IDocuments[];
  website?: string;
  location?: string;
  industry?: string;
  GSTIN?: string;
  address?: IAddress[];
  logo?: string;
  bannerImage?: IBannerImage;
  description?: string;
  createdAt: Date;
  updatedAt: string;
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
