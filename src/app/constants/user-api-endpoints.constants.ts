import { baseUrl, userBaseUrl } from "./api-endpoints.constants";

export const USER_API_ENDPOINTS = {
    PROFILE: {
        GET_PROFILE: `${baseUrl}${userBaseUrl}/me`,

        UPDATE_PROFILE: `${baseUrl}${userBaseUrl}/me`,

        UPDATE_PROFILE_PICTURE: `${baseUrl}${userBaseUrl}/me/profile-picture`,

        DELETE_PROFILE_PICTURE: `${baseUrl}${userBaseUrl}/me/profile-picture`,

        UPDATE_BANNER_IMAGE: `${baseUrl}${userBaseUrl}/me/banner-image`,

        DELETE_BANNER_IMAGE: `${baseUrl}${userBaseUrl}/me/banner-image`,

        GET_RESUME: (resumeName: string, mode: string = "view") =>
            `${baseUrl}${userBaseUrl}/me/resume/${resumeName}?mode=${mode}`,
    },

    SKILLS: {
        GET: `${baseUrl}${userBaseUrl}/me/user-skills`,

        ADD: `${baseUrl}${userBaseUrl}/me/user-skills`,

        DELETE: (id: string) => `${baseUrl}${userBaseUrl}/me/user-skills/${id}`,
    },

    EDUCATION: {
        ADD: `${baseUrl}${userBaseUrl}/me/user-education`,

        UPDATE: `${baseUrl}${userBaseUrl}/me/user-education`,

        DELETE: (index: number) => `${baseUrl}${userBaseUrl}/me/user-education/${index}`,
    },

    EXPERIENCE: {
        ADD: `${baseUrl}${userBaseUrl}/me/user-experience`,

        UPDATE: `${baseUrl}${userBaseUrl}/me/user-experience`,

        DELETE: (index: number) => `${baseUrl}${userBaseUrl}/me/user-experience/${index}`,
    },

    RESUMES: {
        ADD: `${baseUrl}${userBaseUrl}/me/resumes`,

        VIEW: (resumeKey: string) => `${baseUrl}${userBaseUrl}/me/resumes/view?resumeKey=${resumeKey}`,

        DELETE: (documentKey: string) => `${baseUrl}${userBaseUrl}/me/resumes?documentKey=${documentKey}`,
    },
    CERTIFICATES: {
        ADD: `${baseUrl}${userBaseUrl}/me/certificates`,

        VIEW: (certificateKey: string, mode: string) =>
            `${baseUrl}${userBaseUrl}/me/certificates/view?certificateKey=${certificateKey}&mode=${mode}`,

        DELETE: (documentKey: string) => `${baseUrl}${userBaseUrl}/me/certificates?documentKey=${documentKey}`,
    },

    JOB: {
        SEARCH_JOBS: `${baseUrl}${userBaseUrl}/jobs/search`,

        GET_JOB_BY_ID: (jobId: string) => `${baseUrl}${userBaseUrl}/jobs/${jobId}`,

        GET_JOB_BY_SLUG: (slug: string) => `${baseUrl}${userBaseUrl}/jobs/slug/${slug}`,

        APPLY_FOR_JOB: `${baseUrl}${userBaseUrl}/jobs/apply`,
    },

    APPLICATION: {
        GET_STATUS: (jobId: string) => `${baseUrl}${userBaseUrl}/applications/get-status/${jobId}`,

        GET_USER_APPLICATIONS: (page: number, limit: number, status: string) =>
            `${baseUrl}${userBaseUrl}/applications?page=${page}&limit=${page}&status=${status}`,

        GET_INTERVIEWS: `${baseUrl}${userBaseUrl}/applications/interviews`,

        GET_INTERVIEW_STATS: `${baseUrl}${userBaseUrl}/applications/interviews/statistics`,

        GET_INTERVIEW_BY_ID: (interviewId: string) => `${baseUrl}${userBaseUrl}/applications/interviews/${interviewId}`,

        GET_APPLICATION_BY_ID: (id: string) => `${baseUrl}${userBaseUrl}/applications/${id}`,

        WITHDRAW: (id: string) => `${baseUrl}${userBaseUrl}/applications/${id}`,
    },
    RESUME_BULDER: {
        GET_TEMPLATES: `${baseUrl}${userBaseUrl}/resume/templates`,

        GET_DRAFT: `${baseUrl}${userBaseUrl}/resume/draft`,

        SAVE_DRAFT: `${baseUrl}${userBaseUrl}/resume/save-draft`,

        GET_PROFILE_DATA: `${baseUrl}${userBaseUrl}/resume/profile-data`,

        GENERATE_PDF: `${baseUrl}${userBaseUrl}/resume/generate-pdf`,

        UPLOAD_RESUME: `${baseUrl}${userBaseUrl}/resume/upload`,
    },
    OFFERS: {
        LIST_OFFERS: `${baseUrl}${userBaseUrl}/offers`,
        GET_OFFER: (offerId: string) => `${baseUrl}${userBaseUrl}/offers/${offerId}`,
        DOWNLOAD_PDF: (offerId: string) => `${baseUrl}${userBaseUrl}/offers/${offerId}/pdf`,
        RESPOND_TO_OFFER: (offerId: string) => `${baseUrl}${userBaseUrl}/offers/${offerId}/respond`,
        UPLOAD_SIGNED_OFFERLETTER: (offerId: string) => `${baseUrl}${userBaseUrl}/offers/${offerId}/upload-signed`,
    },
} as const;
