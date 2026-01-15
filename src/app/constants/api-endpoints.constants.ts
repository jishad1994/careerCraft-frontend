import { environment } from '../environments/environment';

export const baseUrl = environment.apiUrl;

export const authBaseUrl = environment.authBaseUrl;
export const userBaseUrl = environment.userBaseUrl;
export const adminBaseUrl = environment.adminBaseUrl;
export const companyBaseUrl = environment.companyBaseUrl;
export const skillManagementBaseUrl = environment.skillManagementBaseUrl;

export const API_ENDPOINTS = {
  AUTH: {
    BASE: `/api/auth/`,

    REFRESH: () => `${baseUrl}${authBaseUrl}/refresh`,

    LOGIN: (role: string) => `${baseUrl}${authBaseUrl}/${role}/login`,

    LOGOUT: () => `${baseUrl}${authBaseUrl}/logout`,

    SIGNUP: (role: string) => `${baseUrl}${authBaseUrl}/${role}/signup`,

    REQUEST_OTP: (role: string) =>
      `${baseUrl}${authBaseUrl}/${role}/otp/request`,

    RESEND_OTP: (role: string) => `${baseUrl}${authBaseUrl}/${role}/otp/resend`,

    VERIFY_OTP: (role: string) => `${baseUrl}${authBaseUrl}/${role}/otp/verify`,

    FORGOT_PASSWORD: (role: string) =>
      `${baseUrl}${authBaseUrl}/${role}/forgotPassword`,

    RESET_PASSWORD: (role: string) =>
      `${baseUrl}${authBaseUrl}/${role}/resetPassword`,

    CHECK_PHONE_OR_EMAIL: (role: string) =>
      `${baseUrl}${authBaseUrl}/${role}/check-availability`,

    GOOGLE_AUTH: (role: string) =>
      `${baseUrl}${authBaseUrl}/${role}/googleLogin`,
  },

  ADMIN: {
    GET_USERS: (page: number, limit: number, search?: string) =>
      `${baseUrl}${adminBaseUrl}/getUsers?page=${page}&limit=${limit}&search=${search}`,

    GET_USER_BY_ID: (id: string) => `${baseUrl}${adminBaseUrl}/users/${id}`,

    BLOCK_USER_WITH_COMMENT: (id: string) =>
      `${baseUrl}${adminBaseUrl}/users/${id}/block-with-comment`,

    GET_COMPANIES: (page: number, limit: number, search?: string) =>
      `${baseUrl}${adminBaseUrl}/getCompanies?page=${page}&limit=${limit}&search=${search}`,
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

    JOB: {
      GET_ALL_JOBS: `${baseUrl}${adminBaseUrl}/jobs`,

      VERIFY_JOB: (jobId: string) =>
        `${baseUrl}${adminBaseUrl}/jobs/${jobId}/verify`,

      BLOCK_JOB: (jobId: string) =>
        `${baseUrl}${adminBaseUrl}/jobs/${jobId}/block`,

      UNBLOCK_JOB: (jobId: string) =>
        `${baseUrl}${adminBaseUrl}/jobs/${jobId}/unblock`,
      DELETE_JOB: (jobId: string) => `${baseUrl}${adminBaseUrl}/jobs/${jobId}`,
    },
  },

  USER: {
    PROFILE: {
      GET_PROFILE: `${baseUrl}${userBaseUrl}/me`,

      UPDATE_PROFILE: `${baseUrl}${userBaseUrl}/me`,

      UPDATE_PROFILE_PICTURE: `${baseUrl}${userBaseUrl}/me/profile-picture`,

      DELETE_PROFILE_PICTURE: `${baseUrl}${userBaseUrl}/me/profile-picture`,

      SKILLS: {
        GET: `${baseUrl}${userBaseUrl}/me/user-skills`,

        ADD: `${baseUrl}${userBaseUrl}/me/user-skills`,

        DELETE: (id: string) => `${baseUrl}${userBaseUrl}/me/user-skills/${id}`,
      },

      EDUCATION: {
        ADD: `${baseUrl}${userBaseUrl}/me/user-education`,

        UPDATE: `${baseUrl}${userBaseUrl}/me/user-education`,

        DELETE: (index: number) =>
          `${baseUrl}${userBaseUrl}/me/user-education/${index}`,
      },

      EXPERIENCE: {
        ADD: `${baseUrl}${userBaseUrl}/me/user-experience`,

        UPDATE: `${baseUrl}${userBaseUrl}/me/user-experience`,

        DELETE: (index: number) =>
          `${baseUrl}${userBaseUrl}/me/user-experience/${index}`,
      },

      CERTIFICATES: {
        ADD: `${baseUrl}${userBaseUrl}/me/certificates`,

        DELETE: (documentKey: string) =>
          `${baseUrl}${userBaseUrl}/me/certificates/${documentKey}`,
      },
    },

    JOB: {
      SEARCH_JOBS: `${baseUrl}${userBaseUrl}/jobs/search`,

      GET_JOB_BY_ID: (jobId: string) =>
        `${baseUrl}${userBaseUrl}/jobs/${jobId}`,

      GET_JOB_BY_SLUG: (slug: string) =>
        `${baseUrl}${userBaseUrl}/jobs/slug/${slug}`,

      APPLY_FOR_JOB: (jobId: string) =>
        `${baseUrl}${userBaseUrl}/jobs/${jobId}/apply`,
    },
  },

  COMPANY: {
    PROFILE: {
      GET_PROFILE: `${baseUrl}${companyBaseUrl}/me`,

      UPDATE_PROFILE: `${baseUrl}${companyBaseUrl}/me`,

      UPDATE_PROFILE_PICTURE: `${baseUrl}${companyBaseUrl}/me/profile-picture`,

      DELETE_PROFILE_PICTURE: `${baseUrl}${companyBaseUrl}/me/profile-picture`,

      UPDATE_BANNER_IMAGE: `${baseUrl}${companyBaseUrl}/me/banner-image`,

      DELETE_BANNER_IMAGE: `${baseUrl}${companyBaseUrl}/me/banner-image`,

      UPLOAD_DOCUMENTS: `${baseUrl}${companyBaseUrl}/me/documents`,

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
      
      GET_JOB_STATISTICS: 
        `${baseUrl}${companyBaseUrl}/jobs/statistics`,

      DELETE_JOB: (jobId: string) =>
        `${baseUrl}${companyBaseUrl}/jobs/${jobId}`,
      SEARCH_SKILLS: (query: string, page?: number, limit?: number) =>
        `${baseUrl}${companyBaseUrl}/jobs/search-skills?query=${query}&page=${page}&limit=${limit}`,
    },
  },

  SKILL: {
    CREATE_SKILL: `${baseUrl}${skillManagementBaseUrl}`,

    GET_SKILLS_PAGINATED: `${baseUrl}${skillManagementBaseUrl}`,

    GET_SKILL: (id: string) => `${baseUrl}${skillManagementBaseUrl}/${id}`,

    UPDATE_SKILL: (id: string) => `${baseUrl}${skillManagementBaseUrl}/${id}`,

    TOGGLE_BLOCK: (id: String) =>
      `${baseUrl}${skillManagementBaseUrl}/${id}/toggle-block`,

    DELETE_SKILL: (id: string) => `${baseUrl}${skillManagementBaseUrl}/${id}`,
  },
};
