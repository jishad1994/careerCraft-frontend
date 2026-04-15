import { CompanyProfile } from "../company/company-profile.model";
import { Job } from "../job/job.model";
import { Education, Experience, UserProfile } from "../user/user-profile.model";

export interface JobApplicationStatusResponse {
    hasApplied: boolean;
    application?: IJobApplication;
}

export const JOB_APPLICATION_STATUS = {
    PENDING: "pending",
    REVIEWING: "reviewing",
    SHORTLISTED: "shortlisted",
    INTERVIEWED: "interviewed",
    OFFERED: "offered",
    REJECTED: "rejected",
    WITHDRAWN: "withdrawn",
    HIRED: "hired",
} as const;

export type JobApplicationStatusTypes =
    | "pending"
    | "reviewing"
    | "shortlisted"
    | "interviewed"
    | "offered"
    | "rejected"
    | "withdrawn"
    | "hired";
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
        type: "text" | "document";
        content?: string;
        fileName?: string;
        fileUrl?: string;
        fileKey?: string;
        uploadedAt?: Date;
    };

    expectedSalary?: {
        amount: number;
        currency: string;
        period: "monthly" | "yearly";
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

    interviews?: IInterview[];

    appliedAt: Date;
    viewedAt?: Date;
    viewedBy?: string;
    lastUpdatedAt: Date;

    source?: "direct" | "referral" | "job-board" | "social-media" | "other";
    referredBy?: string;

    isStarred: boolean;
    isArchived: boolean;

    createdAt: Date;
    updatedAt: Date;
}

export interface IJobApplicationDetails extends IJobApplication {
    candidateName: string;
    profilePicture?: {
        key: string;
        location: string;
    };
    experience: number;
    skills: Skill[];
    education: Education[];
    applicantDetails: IApplicantDetails;
    jobDetails: IJobDetails;
    applicantSkills: Skill[];
    companyName: string;
}

export interface IResumeFile {
    fileName: string;
    fileKey: string;
    signedURL: string;
    uploadedAt: string;
}

export interface ICoverLetter {
    type: "text" | "document";
    content?: string;
    fileName?: string;
    fileUrl?: string;
    fileKey?: string;
    uploadedAt?: string;
}

export interface IExpectedSalary {
    amount: number;
    currency: string;
    period: "monthly" | "yearly";
}

export interface IScreeningAnswer {
    question: string;
    answer: string;
}
export interface Skill {
    _id: string;
    name: string;
    description?: string;
    blocked: boolean;
}

export type ApplicationStatus =
    | "pending"
    | "reviewing"
    | "shortlisted"
    | "interviewed"
    | "offered"
    | "rejected"
    | "withdrawn"
    | "hired";

export interface IStatusHistory {
    status: ApplicationStatus;
    changedAt: string;
    changedBy?: string;
    notes?: string;
}

export interface IInterview {
    _id: string;
    round: number;
    type: "phone" | "video" | "in-person" | "technical" | "hr";
    scheduledAt?: Date;
    completedAt?: Date;
    isRescheduled: boolean;
    rescheduledReson: string;
    // interviewers: string[];
    feedback?: string;
    rating?: number;
    status: "scheduled" | "completed" | "cancelled" | "rescheduled";
}

export interface CandidateFilters {
    status: string[];
    skills: string[];
    experience: string[];
    education: string[];
    availability: string[];
    dateRange: string;
    startDate?: string;
    endDate?: string;
    jobId?: string;
}

export interface FilterOption {
    value: string;
    label: string;
    color?: string;
}

export interface IJobDetails {
    _id: string;
    title: string;
    slug: string;
    company: string;
    location: {
        country: string;
        state: string;
        city: string;
    };
    employmentType: string;
    workMode: string;
    status: string;
}

export interface ICompanyDetails {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    location?: string;
}
export interface IApplicantDetails {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    profilePicture?: {
        key: string;
        location: string;
    };
    skills: string[];
    education: Education[];
    experience: Experience[];
    totalExperienceYears: number;
    about?: string;
    location?: string;
}

export interface InterviewFilter {
    companyId?: string;
    jobId?: string;
    applicationId?: string;
    applicantId?: string;
    status?: string[];
    type?: string[];
    round?: number;
    startDate?: Date;
    endDate?: Date;
    search?: string;
}

export interface InterviewWithPopulated {
    _id: string;
    interview: IInterview;
    applicationId: string;
    jobId: string;
    jobTitle: string;
    jobSlug: string;
    companyId: string;
    companyName: string;
    companyEmail: string;
    companyProfilePicture?: {
        key: string;
        location: string;
    };
    applicantId: string;
    applicantName: string;
    applicantEmail: string;
    applicantPhone?: string;
    applicantProfilePicture?: {
        key: string;
        location: string;
    };
    applicationStatus: string;
    appliedAt: Date;
}
export interface InterviewStats {
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    upcoming: number;
    past: number;
}
export interface InterviewReturnState {
    page: number;
    activeTab: "all" | "upcoming" | "completed";
    searchQuery: string;
    selectedStatuses: string[];
    selectedTypes: string[];
    companyId?: string | null;
    jobId?: string | null;
    applicationId?: string | null;
}
