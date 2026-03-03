import { baseUrl, companyBaseUrl } from './api-endpoints.constants';

export const COMPANY_API_ENDPOINTS = {
  PROFILE: {
    GET_PROFILE: `${baseUrl}${companyBaseUrl}/me`,

    UPDATE_PROFILE: `${baseUrl}${companyBaseUrl}/me`,

    UPDATE_COMPANY_ADDRESS: `${baseUrl}${companyBaseUrl}/me/addresses`,

    UPDATE_PROFILE_PICTURE: `${baseUrl}${companyBaseUrl}/me/profile-picture`,

    DELETE_PROFILE_PICTURE: `${baseUrl}${companyBaseUrl}/me/profile-picture`,

    UPDATE_BANNER_IMAGE: `${baseUrl}${companyBaseUrl}/me/banner-image`,

    DELETE_BANNER_IMAGE: `${baseUrl}${companyBaseUrl}/me/banner-image`,

    UPLOAD_DOCUMENTS: `${baseUrl}${companyBaseUrl}/me/documents`,

    REAPPLY_FOR_VERIFICATION: `${baseUrl}${companyBaseUrl}/me/reapply-verification`,

    DELETE_DOCUMENT: (key: string) =>
      `${baseUrl}${companyBaseUrl}/me/documents?key=${key}`,
  },

  JOBS: {
    CREATE_JOB: `${baseUrl}${companyBaseUrl}/jobs`,

    GET_COMPANY_JOBS: `${baseUrl}${companyBaseUrl}/jobs`,

    GET_JOB_BY_ID: (jobId: string) =>
      `${baseUrl}${companyBaseUrl}/jobs/${jobId}`,

    UPDATE_JOB_BY_ID: (jobId: string) =>
      `${baseUrl}${companyBaseUrl}/jobs/${jobId}`,

    UPDATE_JOB_STATUS: (jobId: string) =>
      `${baseUrl}${companyBaseUrl}/jobs/${jobId}/status`,

    GET_JOB_STATISTICS: `${baseUrl}${companyBaseUrl}/jobs/statistics`,

    DELETE_JOB: (jobId: string) => `${baseUrl}${companyBaseUrl}/jobs/${jobId}`,
    SEARCH_SKILLS: (query: string, page?: number, limit?: number) =>
      `${baseUrl}${companyBaseUrl}/jobs/search-skills?query=${query}&page=${page}&limit=${limit}`,
  },

  APPLICATIONS: {
    GET_BY_ID: (id: string) => `${baseUrl}${companyBaseUrl}/applications/${id}`,

    GET_APPLICANTS: `${baseUrl}${companyBaseUrl}/applications`,

    GET_BY_JOB: (jobId: string, page: number, limit: number, status: string) =>
      `${baseUrl}${companyBaseUrl}/jobs/${jobId}/applications?page=${page}&limit=${limit}&status=${status}`,

    UPDATE_STATUS: (id: string) =>
      `${baseUrl}${companyBaseUrl}/applications/${id}/update-status`,
    MARK_AS_VIEWED: (id: string) =>
      `${baseUrl}${companyBaseUrl}/applications/${id}/mark-viewed`,
    TOGGLE_FLAG: (id: string) =>
      `${baseUrl}${companyBaseUrl}/applications/${id}/toggle-flag`,
    ADD_NOTES: (id: string) =>
      `${baseUrl}${companyBaseUrl}/applications/${id}/add-notes`,

    GET_RESUME: (applicationId: string, mode: string = 'view') =>
      `${baseUrl}${companyBaseUrl}/applications/${applicationId}/resume?mode=${mode}`,
  },

  SUBSCRIPTION: {
    GET_ACTIVE_SUBSCRIPTION: `${baseUrl}${companyBaseUrl}/subscriptions/active`,

    GET_PLAN_BY_ID: (planId: string) =>
      `${baseUrl}${companyBaseUrl}/subscriptions/plans/${planId}`,

    GET_ALL_ACTIVE_PLANS: `${baseUrl}${companyBaseUrl}/subscriptions/plans`,

    GET_REMAINING_SUBSCRIPTION_LIMITS: `${baseUrl}${companyBaseUrl}/subscriptions/remaining-limits`,

    CANCEL_SUSBCRIPTION: `${baseUrl}${companyBaseUrl}/subscriptions/cancel`,

    CREATE_PAYMENT_INTEND_AND_SUBSCRIBE: `${baseUrl}${companyBaseUrl}/subscriptions`,

    CONFIRM_PAYMENT_AND_ACTIVATE_SUBSCRIPTION: `${baseUrl}${companyBaseUrl}/subscriptions/payments/confirm`,

    RETRY_PAYMENT: `${baseUrl}${companyBaseUrl}/subscriptions/payments`,

    UPGRADE: `${baseUrl}${companyBaseUrl}/subscriptions/upgrade`,
  },
  CANDIDATES: {
    getCandidateProfile: (candidateId: string) =>
      `${baseUrl}${companyBaseUrl}/candidates/${candidateId}/profile`,

    GET_RESUME_BY_CANDIDATE_ID: (
      candidateId: string,
      resumeKey: string,
      mode: string = 'view',
    ) =>
      `${baseUrl}${companyBaseUrl}/candidates/${candidateId}/resumes?resumeKey=${resumeKey}&mode=${mode}`,
  },
} as const;
