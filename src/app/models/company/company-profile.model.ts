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

export const COMPANY_VERIFICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'verified',
  REJECTED: 'rejected',
} as const;

export enum CompanyRejectionCodes {
  INVALID_DOCUMENT = 'INVALID_DOCUMENT',
  MISMATCHED_GST = 'MISMATCHED_GST',
  INCOMPLETE_PROFILE = 'INCOMPLETE_PROFILE',
  DUPLICATE_COMPANY = 'DUPLICATE_COMPANY',
  OTHER = 'OTHER',
}


export type CompanyVerificationStatus =
  (typeof COMPANY_VERIFICATION_STATUS)[keyof typeof COMPANY_VERIFICATION_STATUS];

export interface RejectionReasonDTO {
  code: CompanyRejectionCodes;
  description?: string;
  rejectedAt: string;
}

export interface CompanyProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profilePicture?: IPublicFileAsset;
  bannerImage?: IPublicFileAsset;
  provider: 'google' | 'local';
  role: 'company';
  isBlocked: boolean;
  verificationStatus: CompanyVerificationStatus;
  rejectionReasons?: RejectionReasonDTO[];
  website?: string;
  location?: string;
  industry?: string;
  GSTIN?: string;
  address?: IAddress[];
  description?: string;
  numberOfEmployees?: number;
  profileCompletion: number;
  documents: IDocuments[];
  subscriptionStatus?: 'active' | 'expired' | 'pending';
  subscriptionStart?: string;
  subscriptionEnd?: string;
  createdAt: string;
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
  verificationStatus: CompanyVerificationStatus;

  industry?: string;
  location?: string;

  profilePicture?: IPublicFileAsset;
  bannerImage?: IPublicFileAsset;

  subscriptionStatus: 'active' | 'expired' | 'pending';

  createdAt: string;
  updatedAt: string;
}

