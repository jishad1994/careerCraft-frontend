import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { Attachment, Conversation, CreateConversationDTO, Message, SendMessageDTO } from "../../../models/chat.model";
import { ApiResponse } from "../../../models/api-response.model";
import { CHAT_ENDPOINTS } from "../../../constants/chat.endpoints.constants";

@Injectable({
    providedIn: "root",
})
export class ChatService {
    private readonly http = inject(HttpClient);

    getConversations(): Observable<ApiResponse<Conversation[]>> {
        return this.http.get<ApiResponse<Conversation[]>>(CHAT_ENDPOINTS.GET_CONVERSATIONS);
    }

    createConversation(data: CreateConversationDTO): Observable<ApiResponse<Conversation>> {
        return this.http.post<ApiResponse<Conversation>>(CHAT_ENDPOINTS.CREATE_CONVERSATION, data);
    }

    getConversationById(id: string): Observable<ApiResponse<Conversation>> {
        return this.http.get<ApiResponse<Conversation>>(CHAT_ENDPOINTS.GET_CONVERSATION_BY_ID(id));
    }

    getMessages(conversationId: string, page = 1, limit = 50): Observable<ApiResponse<Message[]>> {
        return this.http.get<ApiResponse<Message[]>>(CHAT_ENDPOINTS.GET_MESSAGES(conversationId), {
            params: { page: page.toString(), limit: limit.toString() },
        });
    }

    sendMessage(conversationId: string, data: SendMessageDTO): Observable<ApiResponse<Message>> {
        return this.http.post<ApiResponse<Message>>(CHAT_ENDPOINTS.SEND_MESSAGE(conversationId), data);
    }

    uploadFile(
        file: File,
        conversationId: string,
    ): Observable<
        ApiResponse<{
            fileUrl: string;
            fileName: string;
            fileSize: number;
            fileType: string;
            s3Key: string;
        }>
    > {
        const formData = new FormData();
        formData.append("file", file);

        return this.http.post<ApiResponse<Attachment>>(CHAT_ENDPOINTS.UPLOAD_FILE(conversationId), formData);
    }

    markAsRead(conversationId: string): Observable<ApiResponse<void>> {
        return this.http.put<ApiResponse<void>>(CHAT_ENDPOINTS.MARK_AS_READ(conversationId), {});
    }

    getUnreadCount(): Observable<ApiResponse<{ count: number }>> {
        return this.http.get<ApiResponse<{ count: number }>>(CHAT_ENDPOINTS.GET_UNREAD_COUNT);
    }

    deleteMessage(messageId: string): Observable<ApiResponse<{ deleted: boolean }>> {
        return this.http.delete<ApiResponse<{ deleted: boolean }>>(CHAT_ENDPOINTS.DELETE_MESSAGE(messageId));
    }
}
