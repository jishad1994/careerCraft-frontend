import { adminBaseUrl, baseUrl } from './api-endpoints.constants';



export const ADMIN_API_END_POINTS = {
  SUBSCRIPTION_PLANS: {
    GET_PLANS: `${baseUrl}${adminBaseUrl}/subscription-plans`,

    CREATE: `${baseUrl}${adminBaseUrl}/subscription-plans`,

    UPDATE: (planId: string) =>
      `${baseUrl}${adminBaseUrl}/subscription-plans/${planId}`,

    DELETE: (planId: string) =>
      `${baseUrl}${adminBaseUrl}/subscription-plans/${planId}`,
  },

  USER_MANAGEMENT: {
    GET_USERS: (page: number, limit: number, search?: string) =>
      `${baseUrl}${adminBaseUrl}/getUsers?page=${page}&limit=${limit}&search=${search}`,

    GET_USER_BY_ID: (id: string) => `${baseUrl}${adminBaseUrl}/users/${id}`,

    BLOCK_USER_WITH_COMMENT: (id: string) =>
      `${baseUrl}${adminBaseUrl}/users/${id}/block-with-comment`,

    GET_COMPANIES: (
      page: number,
      limit: number,
      search?: string,
      verificationStatus?: string,
    ) =>
      `${baseUrl}${adminBaseUrl}/getCompanies?page=${page}&limit=${limit}&search=${search}&verificationStatus=${verificationStatus}`,
    GET_COMPANY_BY_ID: (id: string) =>
      `${baseUrl}${adminBaseUrl}/companies/${id}`,

    VERIFY_COMPANY: (id: string) =>
      `${baseUrl}${adminBaseUrl}/companies/${id}/verify`,

    REJECT_COMPANY_VERIFICATION: (id: string) =>
      `${baseUrl}${adminBaseUrl}/companies/${id}/reject-verification`,

    GET_COMPANY_DOCUMENT_URL: `${baseUrl}${adminBaseUrl}/documents/signed-url`,

    BLOCK_OR_UNBLOCK_COMPANY: (id: string, action: string) =>
      `${baseUrl}${adminBaseUrl}/companies/${id}/${action}`,

    BLOCK_OR_UNBLOCK_USER: (id: string, action: string) =>
      `${baseUrl}${adminBaseUrl}/users/${id}/${action}`,
  },

  JOB: {
    GET_ALL_JOBS: `${baseUrl}${adminBaseUrl}/jobs`,

    GET_JOB_BY_ID: (id: string) => `${baseUrl}${adminBaseUrl}/jobs/${id}`,

    VERIFY_JOB: (jobId: string) =>
      `${baseUrl}${adminBaseUrl}/jobs/${jobId}/verify`,

    BLOCK_JOB: (jobId: string) =>
      `${baseUrl}${adminBaseUrl}/jobs/${jobId}/block`,

    UNBLOCK_JOB: (jobId: string) =>
      `${baseUrl}${adminBaseUrl}/jobs/${jobId}/unblock`,
    DELETE_JOB: (jobId: string) => `${baseUrl}${adminBaseUrl}/jobs/${jobId}`,

    GET_APPLICATIONS_BY_JOB: (jobId: string, page: number, limit: number) =>
      `${baseUrl}${adminBaseUrl}/jobs/${jobId}/applications?page=${page}&limit=${limit}`,
  },
} as const;
