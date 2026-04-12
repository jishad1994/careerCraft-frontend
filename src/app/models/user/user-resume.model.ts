

export interface ResumePersonalInfo {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedIn: string;
    portfolio: string;
}

export interface ResumeSummary {
    text: string;
}

export interface ResumeExperience {
    jobTitle: string;
    company: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    description: string;
    achievements: string[];
}

export interface ResumeEducation {
    degree: string;
    institution: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    grade: string;
}

export interface ResumeSkill {
    name: string;
    category: string;
}

export type ResumeTemplateId = "classic" | "modern" | "minimal";

export interface ResumeTemplate {
    id: ResumeTemplateId;
    name: string;
    description: string;
}

export interface ResumeData {
    personalInfo: ResumePersonalInfo;
    summary: ResumeSummary;
    experience: ResumeExperience[];
    education: ResumeEducation[];
    skills: ResumeSkill[];
    templateId: ResumeTemplateId;
}

export interface ProfileDataResponse {
    personalInfo: ResumePersonalInfo;
    summary: ResumeSummary;
    experience: ResumeExperience[];
    education: ResumeEducation[];
    skills: ResumeSkill[];
}

export interface SavedResumeResponse {
    personalInfo: ResumePersonalInfo;
    summary: ResumeSummary;
    experience: ResumeExperience[];
    education: ResumeEducation[];
    skills: ResumeSkill[];
    templateId: ResumeTemplateId;
    lastSavedAt: string;
}


