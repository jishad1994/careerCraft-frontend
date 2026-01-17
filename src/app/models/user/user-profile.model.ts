import { IAddress } from '../company/company-profile.model';
import { Skill } from '../skill.model';

export interface IPublicFileAsset {
  key: string;
  location: string;
}

export interface Education {
  type: string;
  institution: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  grade?: string;
}

export interface Experience {
  jobTitle: string;
  company: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
}
export interface IResume extends IDocuments {}

interface PopulatedSkill {
  id: string;
  name: string;
}
export interface IDocuments {
  originalName: string;
  key: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  profilePicture?: IPublicFileAsset;
  about: string;
  provider: string;
  isBlocked: boolean;
  isVerified: boolean;
  skills: PopulatedSkill[];
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  education: Education[];
  experience: Experience[];
  certificates: IDocuments[];
  resumeURL: IDocuments[];
  location: string;
  address: IAddress;
  createdAt: string;
  updatedAt: string;
}

export interface IUserListItem {
  _id: string;

  firstName: string;
  lastName: string;
  email: string;
  phone?: string;

  provider: 'local' | 'google';
  role: 'user' | 'company';

  isBlocked: boolean;

  profilePicture?: IPublicFileAsset;

  location?: string;

  createdAt: string; // ISO string
  updatedAt: string;
}
