import { environment } from '../environments/environment';

export const baseUrl = environment.apiUrl;

export const API_ENDPOINTS = {
  AUTH: {
    BASE: `/api/auth/`,

    REFRESH: () => `${baseUrl}/api/auth/refresh`,

    LOGIN: (role: string) => `${baseUrl}/api/auth/${role}/login`,

    LOGOUT: () => `${baseUrl}/api/auth/logout`,

    SIGNUP: (role: string) => `${baseUrl}/api/auth/${role}/signup`,

    REQUEST_OTP: (role: string) => `${baseUrl}/api/auth/${role}/otp/request`,

    RESEND_OTP: (role: string) => `${baseUrl}/api/auth/${role}/otp/resend`,

    VERIFY_OTP: (role: string) => `${baseUrl}/api/auth/${role}/otp/verify`,

    FORGOT_PASSWORD: (role: string) =>
      `${baseUrl}/api/auth/${role}/forgotPassword`,

    RESET_PASSWORD: (role: string) =>
      `${baseUrl}/api/auth/${role}/resetPassword`,

    CHECK_PHONE_OR_EMAIL: (role: string) =>
      `${baseUrl}/api/auth/${role}/check-availability`,

    GOOGLE_AUTH: (role: string) => `${baseUrl}/api/auth/${role}/googleLogin`,
  },

  ADMIN: {
    GET_USERS: (page: number, limit: number, search?: string) =>
      `${baseUrl}/api/admin/getUsers?page=${page}&limit=${limit}&search=${search}`,

    GET_COMPANIES: (page: number, limit: number, search?: string) =>

     `${baseUrl}/api/admin/getCompanies?page=${page}&limit=${limit}&search=${search}`,

    BLOCK_OR_UNBLOCK_COMPANY: (id: string, action: string) =>
      `${baseUrl}/api/admin/companies/${id}/${action}`,

    BLOCK_OR_UNBLOCK_USER: (id: string, action: string) =>
      `${baseUrl}/api/admin/users/${id}/${action}`,

    JOB: {
      GET_ALL_JOBS: `${baseUrl}/api/admin/jobs`,

      VERIFY_JOB: (jobId: string) =>
        `${baseUrl}/api/admin/jobs/${jobId}/verify`,

      BLOCK_JOB: (jobId: string) =>
        `${baseUrl}/api/admin/jobs/${jobId}/block`,

      UNBLOCK_JOB: (jobId: string) =>
        `${baseUrl}/api/admin/jobs/${jobId}/unblock`,
      DELETE_JOB: (jobId: string) =>
        `${baseUrl}/api/admin/jobs/${jobId}`,

    },
  },
  USER: {
    PROFILE: {
      GET_PROFILE: `${baseUrl}/api/user/me`,

      UPDATE_PROFILE: `${baseUrl}/api/user/me`,

      UPDATE_PROFILE_PICTURE: `${baseUrl}/api/user/me/profile-picture`,

      DELETE_PROFILE_PICTURE: `${baseUrl}/api/user/me/profile-picture`,

      SKILLS: {
        GET: `${baseUrl}/api/user/me/user-skills`,

        ADD: `${baseUrl}/api/user/me/user-skills`,

        DELETE: (id: string) => `${baseUrl}/api/user/me/user-skills/${id}`,
      },

      EDUCATION: {
        ADD: `${baseUrl}/api/user/me/user-education`,

        UPDATE: `${baseUrl}/api/user/me/user-education`,

        DELETE: (index: number) =>
          `${baseUrl}/api/user/me/user-education/${index}`,
      },

      EXPERIENCE: {
        ADD: `${baseUrl}/api/user/me/user-experience`,

        UPDATE: `${baseUrl}/api/user/me/user-experience`,

        DELETE: (index: number) =>
          `${baseUrl}/api/user/me/user-experience/${index}`,
      },

      CERTIFICATES: {
        ADD: `${baseUrl}/api/user/me/certificates`,

        DELETE: (documentKey: string) =>
          `${baseUrl}/api/user/me/certificates/${documentKey}`,
      },
    },

    JOB: {
      SEARCH_JOBS: `${baseUrl}/api/user/jobs/search`,

      GET_JOB_BY_ID: (jobId: string) => `${baseUrl}/api/user/jobs/${jobId}`,

      GET_JOB_BY_SLUG: (slug: string) =>
        `${baseUrl}/api/user/jobs/slug/${slug}`,

      APPLY_FOR_JOB: (jobId: string) =>
        `${baseUrl}/api/user/jobs/${jobId}/apply`,
    },
  },

  COMPANY: {
    PROFILE: {
      GET_PROFILE: `${baseUrl}/api/company/me`,

      UPDATE_PROFILE: `${baseUrl}/api/company/me`,

      UPDATE_PROFILE_PICTURE: `${baseUrl}/api/company/me/profile-picture`,

      DELETE_PROFILE_PICTURE: `${baseUrl}/api/company/me/profile-picture`,

      UPDATE_BANNER_IMAGE: `${baseUrl}/api/company/me/banner-image`,

      DELETE_BANNER_IMAGE: `${baseUrl}/api/company/me/banner-image`,

      UPLOAD_DOCUMENTS: `${baseUrl}/api/company/me/documents`,

      DELETE_DOCUMENT: (key: string) =>
        `${baseUrl}/api/company/me/documents?key=${key}`,
    },

    JOBS: {
      CREATE_JOB: `${baseUrl}/api/company/jobs`,

      GET_COMPANY_JOBS: `${baseUrl}/api/company/jobs`,

      GET_JOB_BY_ID: (jobId: string) => `${baseUrl}/api/company/jobs/${jobId}`,

      UPDATE_JOB_BY_ID: (jobId: string) =>
        `${baseUrl}/api/company/jobs/${jobId}`,

      UPDATE_JOB_STATUS: (jobId: string) =>
        `${baseUrl}/api/company/jobs/${jobId}/status`,

      DELETE_JOB: (jobId: string) => `${baseUrl}/api/company/jobs/${jobId}`,
    },
  },

  SKILL: {
    CREATE_SKILL: `${baseUrl}/api/skills`,

    GET_SKILLS_PAGINATED: `${baseUrl}/api/skills`,

    GET_SKILL: (id: string) => `${baseUrl}/api/skills/${id}`,

    UPDATE_SKILL: (id: string) => `${baseUrl}/api/skills/${id}`,

    TOGGLE_BLOCK: (id: String) => `${baseUrl}/api/skills/${id}/toggle-block`,

    DELETE_SKILL: (id: string) => `${baseUrl}/api/skills/${id}`,
  },
};
