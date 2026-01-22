import { CompanyProfile } from '../company/company-profile.model';
import { Job } from '../job/job.model';
import { UserProfile } from '../user/user-profile.model';

export interface JobApplicationStatusResponse {
  hasApplied: boolean;
  application?: IJobApplication;
}

export type JobApplicationStatusTypes =
  | 'pending'
  | 'reviewing'
  | 'shortlisted'
  | 'interviewed'
  | 'offered'
  | 'rejected'
  | 'withdrawn'
  | 'hired';
export interface IJobApplication {
  _id: string;
  job: Job;
  applicant: UserProfile;
  company: CompanyProfile;

  resume: {
    fileName: string;
    fileKey: string;
    uploadedAt: Date;
    signedURL?: string;
  };

  coverLetter: {
    type: 'text' | 'document';
    content?: string;
    fileName?: string;
    fileUrl?: string;
    fileKey?: string;
    uploadedAt?: Date;
  };

  expectedSalary?: {
    amount: number;
    currency: string;
    period: 'monthly' | 'yearly';
  };

  availableFrom?: Date;
  noticePeriod?: number;

  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  otherLinks?: string[];

  screeningAnswers?: Array<{
    question: string;
    answer: string;
  }>;

  status: JobApplicationStatusTypes;

  statusHistory: Array<{
    status: JobApplicationStatusTypes;
    changedAt: Date;
    changedBy?: string;
    notes?: string;
  }>;

  notes?: string;
  feedback?: string;

  interviews?: Array<{
    round: number;
    type: 'phone' | 'video' | 'in-person' | 'technical' | 'hr';
    scheduledAt?: Date;
    completedAt?: Date;
    interviewers?: string;
    feedback?: string;
    rating?: number; // 1-5
    status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  }>;

  appliedAt: Date;
  viewedAt?: Date;
  viewedBy?: string;
  lastUpdatedAt: Date;

  source?: 'direct' | 'referral' | 'job-board' | 'social-media' | 'other';
  referredBy?: string;

  isStarred: boolean;
  isArchived: boolean;

  createdAt: Date;
  updatedAt: Date;
}
