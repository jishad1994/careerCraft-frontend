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
    GET_USERS_PAGINATED: (page: number, limit: number) =>
      `${baseUrl}/api/admin/getUsersPaginated?page=${page}&limit=${limit}`,

    GET_COMPANIES_PAGINATED: (page: number, limit: number) =>
      `${baseUrl}/api/admin/getCompaniesPaginated?page=${page}&limit=${limit}`,

    GET_COMPANIES: (query: string) =>
      `${baseUrl}/api/admin/getCompanies?search=${query}`,

    GET_USERS: (query: string) =>
      `${baseUrl}/api/admin/getUsers?search=${query}`,

    BLOCK_OR_UNBLOCK_COMPANY: (id: string, action: string) =>
      `${baseUrl}/api/admin/companies/${id}/${action}`,

    BLOCK_OR_UNBLOCK_USER: (id: string, action: string) =>
      `${baseUrl}/api/admin/users/${id}/${action}`,
  },
  USER: {
    PROFILE: {
      GET_PROFILE: `${baseUrl}/api/user/me`,

      UPDATE_PROFILE: `${baseUrl}/api/user/me`,

      UPDATE_PROFILE_PICTURE: `${baseUrl}/api/user/me/profile-picture`,

      DELETE_PROFILE_PICTURE: `${baseUrl}/api/user/me/profile-picture`,

      SKILLS: {
        ADD: `${baseUrl}/api/user/me/userSkills`,
        DELETE: (id: string) => `${baseUrl}/api/user/me/userSkills/${id}`,
      },

      EDUCATION: {
        ADD: `${baseUrl}/api/user/me/userEducation`,
        UPDATE: `${baseUrl}/api/user/me/userEducation`,

        DELETE: (index: number) =>
          `${baseUrl}/api/user/me/userEducation/${index}`,
      },

      EXPERIENCE: {
        ADD: `${baseUrl}/api/user/me/userExperience`,

        UPDATE: `${baseUrl}/api/user/me/userExperience`,

        DELETE: (index: number) =>
          `${baseUrl}/api/user/me/userExperience/${index}`,
      },
    },
  },

  COMPANY: {
    PROFILE: {
      GET_PROFILE: `${baseUrl}/api/company/me`,

      UPDATE_PROFILE: `${baseUrl}/api/company/me`,

      UPDATE_PROFILE_PICTURE: `${baseUrl}/api/company/me/profile-picture`,

      UPDATE_BANNER_IMAGE: `${baseUrl}/api/company/me/banner-image`,

      UPLOAD_DOCUMENTS: `${baseUrl}/api/company/me/documents`,

      DELETE_DOCUMENT: `${baseUrl}/api/company/me/documents`,
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
