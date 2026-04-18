import { environment } from '../environments/environment';

export const baseUrl = environment.apiUrl;
export const authBaseUrl = environment.authBaseUrl;
export const userBaseUrl = environment.userBaseUrl;
export const adminBaseUrl = environment.adminBaseUrl;
export const companyBaseUrl = environment.companyBaseUrl;
export const skillManagementBaseUrl = environment.skillManagementBaseUrl;

export const publicLocationApiUrl = environment.PUBLIC_LOCATION_API_URL;

export const API_ENDPOINTS = {
  COMMON: {
    PUBLIC_LOCATION_API_URL: (query: string) =>
      `${publicLocationApiUrl}/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
  },
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

  SKILL: {
    CREATE_SKILL: `${baseUrl}${skillManagementBaseUrl}`,

    GET_SKILLS_PAGINATED: `${baseUrl}${skillManagementBaseUrl}`,

    GET_SKILL: (id: string) => `${baseUrl}${skillManagementBaseUrl}/${id}`,

    UPDATE_SKILL: (id: string) => `${baseUrl}${skillManagementBaseUrl}/${id}`,

    TOGGLE_BLOCK: (id: string) =>
      `${baseUrl}${skillManagementBaseUrl}/${id}/toggle-block`,

    DELETE_SKILL: (id: string) => `${baseUrl}${skillManagementBaseUrl}/${id}`,
  },
};
