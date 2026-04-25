import { Skill } from "../skill.model";
export type JobStatus = "draft" | "active" | "paused" | "closed" | "expired";

export interface Job {
    _id: string;
    title: string;
    slug: string;
    company: {
        _id: string;
        name: string;
        email: string;
        location?: string;
    };
    description: string;
    responsibilities: string[];
    requirements: string[];
    employmentType: "full-time" | "part-time" | "contract" | "internship" | "freelance";
    workMode: "onsite" | "remote" | "hybrid";
    experience: {
        min: number;
        max?: number;
    };
    salary: {
        min?: number;
        max?: number;
        currency: string;
        period: "monthly" | "yearly";
        isHidden: boolean;
    };
    location: {
        country: string;
        state?: string;
        city: string;
    };
    skills: Skill[];
    openings: number;
    status: "draft" | "active" | "paused" | "closed" | "expired";
    isVerified: boolean;
    isFeatured: boolean;
    applicationsCount: number;
    viewsCount: number;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface JobSearchFilters {
    keyword?: string;
    location?: string;
    employmentType?: string;
    workMode?: string;
    minSalary?: number;
    maxSalary?: number;
    experienceMin?: number;
    experienceMax?: number;
    skills?: string[];
    status?: string;
}

export interface CreateJobDto {
    title: string;
    description: string;
    responsibilities: string[];
    requirements: string[];
    employmentType: string;
    workMode: string;
    experience: {
        min: number;
        max?: number;
    };
    salary?: {
        min?: number;
        max?: number;
        currency?: string;
        period?: string;
        isHidden?: boolean;
    };
    location: {
        country: string;
        state?: string;
        city: string;
    };
    expiresAt?: Date;
    skills: string[];
    openings: number;
}

export interface JobStatistics {
    total: number;
    active: number;
    draft: number;
    paused: number;
    closed: number;
    totalApplications: number;
    totalViews: number;
    verified: number;
}
