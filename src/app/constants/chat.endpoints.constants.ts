import { baseUrl } from "./api-endpoints.constants";
export const CHAT_ENDPOINTS = {
    GET_CONVERSATIONS: `${baseUrl}/api/conversations`,

    CREATE_CONVERSATION: `${baseUrl}/api/conversations`,

    GET_CONVERSATION_BY_ID: (id: string) => `${baseUrl}/api/conversations/${id}`,

    GET_MESSAGES: (id: string) => `${baseUrl}/api/conversations/${id}/messages`,

    SEND_MESSAGE: (id: string) => `${baseUrl}/api/conversations/${id}/messages`,

    UPLOAD_FILE: (id: string) => `${baseUrl}/api/conversations/${id}/upload`,

    MARK_AS_READ: (id: string) => `${baseUrl}/api/conversations/${id}/read`,

    GET_UNREAD_COUNT: `${baseUrl}/api/conversations/unread-count`,

    DELETE_MESSAGE: (messageId: string) => `${baseUrl}/api/conversations/messages/${messageId}`,
} as const;
