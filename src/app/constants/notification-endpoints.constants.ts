import { baseUrl } from './api-endpoints.constants';

export const NOTIFICATION_ENDPOINTS = {
  GET_NOTIFICATIONS: `${baseUrl}/api/notifications`,

  GET_UNREAD_COUNT: `${baseUrl}/api/notifications/unread-count`,

  MARK_AS_READ: (notificationId: string) =>
    `${baseUrl}/api/notifications/${notificationId}/read`,

  MARK_ALL_AS_READ: `${baseUrl}/api/notifications/read-all`,

  DELETE_NOTIFICATION: (notificationId: string) =>
    `${baseUrl}/api/notifications/${notificationId}`,

  CLEAR_ALL_NOTIFICATIONS: `${baseUrl}/api/notifications/delete-all`,
} as const;
