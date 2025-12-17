import { Skill } from './skill.model';

export interface Education {
  type: string;
  institution: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  grade: string;
}

export interface Experience {
  jobTitle: string;
  company: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  profilePicture?: { key: string; location: string };
  about: string;
  provider: string;
  isBlocked: boolean;
  skills: Skill[];
  education: Education[];
  experience: Experience[];
  location: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}
