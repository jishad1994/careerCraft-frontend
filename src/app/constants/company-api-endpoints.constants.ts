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
} as const;
