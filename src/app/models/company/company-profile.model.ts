export class IAddress {
  city!: string;
  state!: string;
  country!: string;
  postalCode!: string;
}

export interface CompanyProfile {
  id: string;
  name: string;
  email: string;
  role: 'company';
  phone?: string;
  profilePicture?: { key: string; location: string };
  isBlocked: boolean;
  isVerified: boolean;
  documents: string[];
  website?: string;
  location?: string;
  industry?: string;
  GSTIN?: string;
  address?: IAddress[];
  logo?: string;
  bannerImage?: string;
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
