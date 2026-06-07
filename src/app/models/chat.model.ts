export interface Conversation {
    _id: string;
    participants: Participant[];
    jobId?: string;
    applicationId?: string;
    lastMessage?: LastMessage;
    initiatedBy: string;
    status: "active" | "archived" | "blocked";
    createdAt: string;
    updatedAt: string;
}

export interface Participant {
    userId: string;
    userType: "User" | "Company";
    lastReadAt: string;
    unreadCount: number;
    participantName?: string; 
    participantAvatar?: string;
}

export interface LastMessage {
    content: string;
    senderId: string;
    createdAt: string;
    messageType: "text" | "file" | "system";
}

// message.model.ts (Angular)
export interface Message {
    _id: string;
    conversationId: string;
    senderId: string;
    senderType: "User" | "Company";
    receiverId: string;
    receiverType: "User" | "Company";
    content: string;
    messageType: "text" | "file" | "system";
    attachments: Attachment[];
    status: "sent" | "delivered" | "read";
    readBy: string[];
    deliveredAt?: string;
    readAt?: string;
    isEdited: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Attachment {
    fileUrl: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    s3Key: string;
}

export interface SendMessageDTO {
    conversationId: string;
    content: string;
    messageType?: "text" | "file" | "system";
    attachments?: Attachment[];
}

export interface CreateConversationDTO {
    otherUserId: string;
    jobId?: string;
    applicationId?: string;
}

export interface TypingIndicator {
    conversationId: string;
    userId: string;
    isTyping: boolean;
}

export interface MiniChat {
    conversation: Conversation;
    isOpen: boolean;
    messages: Message[];
    unreadCount: number;
}
