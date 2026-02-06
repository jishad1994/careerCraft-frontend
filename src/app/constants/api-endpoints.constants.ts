import { environment } from '../environments/environment';

const baseUrl = environment.apiUrl;

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

  ADMIN: {},

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
          `${baseUrl}${userBaseUrl}/me/certificates?documentKey=${documentKey}`,
      },
      RESUMES: {
        ADD: `${baseUrl}${userBaseUrl}/me/resumes`,

        DELETE: (documentKey: string) =>
          `${baseUrl}${userBaseUrl}/me/resumes?documentKey=${documentKey}`,
      },
    },

    JOB: {
      SEARCH_JOBS: `${baseUrl}${userBaseUrl}/jobs/search`,

      GET_JOB_BY_ID: (jobId: string) =>
        `${baseUrl}${userBaseUrl}/jobs/${jobId}`,

      GET_JOB_BY_SLUG: (slug: string) =>
        `${baseUrl}${userBaseUrl}/jobs/slug/${slug}`,

      APPLY_FOR_JOB: `${baseUrl}${userBaseUrl}/jobs/apply`,
    },

    APPLICATION: {
      GET_STATUS: (jobId: string) =>
        `${baseUrl}${userBaseUrl}/applications/get-status/${jobId}`,

      GET_USER_APPLICATIONS: (page: number, limit: number, status: string) =>
        `${baseUrl}${userBaseUrl}/applications?page=${page}&limit=${page}&status=${status}`,

      GET_APPLICATION_BY_ID: (id: string) =>
        `${baseUrl}${userBaseUrl}/applications/${id}`,
      WITHDRAW: (id: string) => `${baseUrl}${userBaseUrl}/applications/${id}`,
    },
  },

  COMPANY: {
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

      DELETE_JOB: (jobId: string) =>
        `${baseUrl}${companyBaseUrl}/jobs/${jobId}`,
      SEARCH_SKILLS: (query: string, page?: number, limit?: number) =>
        `${baseUrl}${companyBaseUrl}/jobs/search-skills?query=${query}&page=${page}&limit=${limit}`,
    },

    APPLICATIONS: {
      GET_BY_ID: (id: string) =>
        `${baseUrl}${companyBaseUrl}/applications/${id}`,
      GET_ALL: (page: number, limit: number, jobId: string, status: string) =>
        `${baseUrl}${companyBaseUrl}/applications?page=${page}&limit=${limit}&jobId=${jobId}&status=${status}`,
      GET_BY_JOB: (
        jobId: string,
        page: number,
        limit: number,
        status: string,
      ) =>
        `${baseUrl}${companyBaseUrl}/jobs/${jobId}/applications?page=${page}&limit=${limit}&status=${status}`,
      UPDATE_STATUS: (id: string) =>
        `${baseUrl}${companyBaseUrl}/applications/${id}/update-status`,
      MARK_AS_VIEWED: (id: string) =>
        `${baseUrl}${companyBaseUrl}/applications/${id}/mark-viewed`,
      ADD_NOTES: (id: string) =>
        `${baseUrl}${companyBaseUrl}/applications/${id}/add-notes`,
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
