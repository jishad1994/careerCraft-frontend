import { Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { io, Socket } from "socket.io-client";
import { INotification } from "../../../models/notification/notification.model";
import { environment } from "../../../environments/environment";
import { Message, TypingIndicator } from "../../../models/chat.model";

export interface WebRTCOffer {
    offer: RTCSessionDescriptionInit;
    from: string;
}

export interface WebRTCAnswer {
    answer: RTCSessionDescriptionInit;
    from: string;
}

export interface ICECandidate {
    candidate: RTCIceCandidateInit;
    from: string;
}

export interface UserJoined {
    userId: string;
    role: "user" | "company" | "admin";
    socketId: string;
}

export interface UserLeft {
    userId: string;
    socketId: string;
}

export interface ConnectionRequested {
    from: string;
    roomId: string;
}

export interface Participant {
    userId: string;
    role: "user" | "company" | "admin";
    socketId: string;
    joinedAt: Date;
    leftAt?: Date;
    status: "waiting" | "connected" | "disconnected";
}

export interface CallSession {
    _id?: string;
    interviewId: string;
    applicationId: string;
    roomId: string;
    participants: Participant[];
    callType: "video" | "audio";
    status: "waiting" | "active" | "ended";
    startedAt: Date;
    endedAt?: Date;
    duration?: number;
    recordingUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface JoinedInterview {
    roomId: string;
    session: CallSession;
    shouldInitiate: boolean;
    existingParticipants: Participant[];
}

export interface NotificationCount {
    count: number;
}

export interface SocketError {
    message: string;
}

export interface NotificationMarkRead {
    notificationId: string;
}

@Injectable({
    providedIn: "root",
})
export class SocketService implements OnDestroy {
    private socket: Socket | null = null;
    private readonly connected$ = new BehaviorSubject<boolean>(false);

    //notification streams
    private readonly notification$ = new Subject<INotification>();
    private readonly unreadCount$ = new BehaviorSubject<number>(0);
    // WebRTC streams
    private readonly webrtcOffer$ = new Subject<WebRTCOffer>();
    private readonly webrtcAnswer$ = new Subject<WebRTCAnswer>();
    private readonly iceCandidate$ = new Subject<ICECandidate>();
    private readonly userJoined$ = new Subject<UserJoined>();
    private readonly userLeft$ = new Subject<UserLeft>();
    private readonly joinedInterview$ = new Subject<JoinedInterview>();
    private readonly connectionRequested$ = new Subject<ConnectionRequested>();
    private readonly interviewEnded$ = new Subject<void>();

    //chat streams
    private readonly chatNewMessage$ = new Subject<Message>();
    private readonly chatMessageNotification$ = new Subject<{ conversationId: string; message: Message }>();
    private readonly chatTyping$ = new Subject<TypingIndicator>();
    private readonly chatMessagesDelivered$ = new Subject<{ conversationId: string; messageIds: string[] }>();
    private readonly chatMessagesRead$ = new Subject<{ conversationId: string; messageIds: string[]; readBy: string }>();
    private readonly chatUnreadCount$ = new BehaviorSubject<number>(0);
    private readonly chatJoined$ = new Subject<{ conversationId: string; success: boolean }>();

    private readonly error$ = new Subject<string>();
    private joinedConversationIds = new Set<string>();
    private listenersInitialized = false;
    // constructor() {}

    connect(): void {
        if (this.socket?.connected) {
            return;
        }

        if (this.socket && !this.socket.connected) {
            this.socket.connect();
            return;
        }

        this.socket = io(environment.apiUrl, {
            withCredentials: true,
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
        });
        this.listenersInitialized = false;
        this.setupEventListeners();
    }

    setupEventListeners(): void {
        if (!this.socket || this.listenersInitialized) return;
        this.listenersInitialized = true;
        this.socket.on("connect", () => {
            this.connected$.next(true);
            this.requestUnreadCount();
            this.requestChatUnreadCount();
            this.rejoinChatRooms();
        });

        this.socket.on("disconnect", () => {
            this.connected$.next(false);
        });

        this.socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
            this.error$.next(error.message || " socket connection error");
        });

        //notification events
        this.socket.on("notification:new", (notification: INotification) => {
            this.notification$.next(notification);
            this.incrementUnreadCount();
        });

        this.socket.on("notification:count", (data: { count: number }) => {
            this.unreadCount$.next(data.count);
        });

        // ============ CHAT EVENTS ============

        // New message received
        this.socket.on("chat:newMessage", (message: Message) => {
            this.chatNewMessage$.next(message);
        });

        // Message notification (when not in conversation)
        this.socket.on("chat:messageNotification", (data: { conversationId: string; message: Message }) => {
            this.chatMessageNotification$.next(data);
        });

        // Typing indicator
        this.socket.on("chat:typing", (data: TypingIndicator) => {
            this.chatTyping$.next(data);
        });

        // Messages delivered
        this.socket.on("chat:messagesDelivered", (data: { conversationId: string; messageIds: string[] }) => {
            this.chatMessagesDelivered$.next(data);
        });

        // Messages read
        this.socket.on("chat:messagesRead", (data: { conversationId: string; messageIds: string[]; readBy: string }) => {
            this.chatMessagesRead$.next(data);
        });

        // Unread count update
        this.socket.on("chat:unreadCount", (data: { count: number }) => {
            this.chatUnreadCount$.next(data.count);
        });

        // Joined conversation
        this.socket.on("chat:joined", (data: { conversationId: string; success: boolean }) => {
            this.chatJoined$.next(data);
        });

        // ============ WEBRTC SIGNALING EVENTS ============

        // Joined interview confirmation
        this.socket.on("joined-interview", (data: JoinedInterview) => {
            this.joinedInterview$.next(data);
        });

        // User joined room
        this.socket.on("user-joined", (data: UserJoined) => {
            this.userJoined$.next(data);
        });

        // User left room
        this.socket.on("user-left", (data: UserLeft) => {
            this.userLeft$.next(data);
        });

        // Connection requested by late joiner
        this.socket.on("connection-requested", (data: ConnectionRequested) => {
            this.connectionRequested$.next(data);
        });

        // WebRTC offer received
        this.socket.on("webrtc-offer", (data: WebRTCOffer) => {
            this.webrtcOffer$.next(data);
        });

        // WebRTC answer received
        this.socket.on("webrtc-answer", (data: WebRTCAnswer) => {
            this.webrtcAnswer$.next(data);
        });

        // ICE candidate received
        this.socket.on("ice-candidate", (data: ICECandidate) => {
            this.iceCandidate$.next(data);
        });

        // Interview ended
        this.socket.on("interview-ended", () => {
            this.interviewEnded$.next();
        });

        //error handling for socket events
        this.socket.on("error", (error: { message: string }) => {
            this.error$.next(error.message);
        });

        this.socket.on("reconnect", (_attemptNumber: number) => {
            this.connected$.next(true);
            this.requestUnreadCount();
            this.requestChatUnreadCount();
            this.rejoinChatRooms();
        });

        this.socket.on("reconnect_error", (error: Error) => {
            console.error("Reconnection error:", error);
        });

        this.socket.on("reconnect_failed", () => {
            console.error("Reconnection failed after all attempts");
            this.error$.next("Failed to reconnect to notification server");
        });
    }

    /**
     * Disconnect socket
     */
    disconnect(): void {
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
            this.listenersInitialized = false;
            this.joinedConversationIds.clear();
            this.connected$.next(false);
        }
    }

    /**
     * Check if socket is connected
     */
    isConnected(): Observable<boolean> {
        return this.connected$.asObservable();
    }

    /**
     * Get new notifications stream
     */
    onNotification(): Observable<INotification> {
        return this.notification$.asObservable();
    }

    /**
     * Get unread count stream
     */
    getUnreadCount(): Observable<number> {
        return this.unreadCount$.asObservable();
    }

    /**
     * Get error stream
     */
    onError(): Observable<string> {
        return this.error$.asObservable();
    }

    /**
     * Request current unread count from server
     */
    requestUnreadCount(): void {
        if (this.socket?.connected) {
            this.socket.emit("notification:getCount");
        }
    }

    /**
     * Mark notification as read
     */
    markAsRead(notificationId: string): void {
        if (this.socket?.connected) {
            this.socket.emit("notification:markRead", { notificationId });
            this.decrementUnreadCount();
        }
    }

    /**
     * Mark all notifications as read
     */
    markAllAsRead(): void {
        if (this.socket?.connected) {
            this.socket.emit("notification:markAllRead");
            this.unreadCount$.next(0);
        }
    }

    // ============ CHAT METHODS ============

    private rejoinChatRooms(): void {
        if (!this.socket?.connected) return;

        this.joinedConversationIds.forEach((conversationId) => {
            this.socket?.emit("chat:join", { conversationId });
        });
    }

    requestChatUnreadCount(): void {
        if (this.socket?.connected) {
            this.socket.emit("chat:getUnreadCount");
        }
    }

    /**
     * Join conversation room
     */
    joinConversation(conversationId: string): void {
        this.joinedConversationIds.add(conversationId);

        if (!this.socket?.connected) {
            this.connect();
            return;
        }

        this.socket.emit("chat:join", { conversationId });
    }

    /**
     * Leave conversation room
     */
    leaveConversation(conversationId: string): void {
        this.joinedConversationIds.delete(conversationId);

        if (this.socket?.connected) {
            this.socket.emit("chat:leave", { conversationId });
        }
    }

    /**
     * Send message via socket
     */
    sendChatMessage(data: {
        conversationId: string;
        content: string;
        messageType?: "text" | "file" | "system";
        attachments?: unknown[];
    }): void {
        if (!this.socket?.connected) {
            this.connect();
            this.error$.next("Chat connection was lost. Reconnecting, please try again.");
            return;
        }

        this.socket.emit("chat:sendMessage", data);
    }

    /**
     *
     *
     * Emit typing start
     */
    startTyping(conversationId: string, receiverId: string): void {
        if (this.socket?.connected) {
            this.socket.emit("chat:typing:start", { conversationId, receiverId });
        }
    }

    /**
     * Emit typing stop
     */
    stopTyping(conversationId: string, receiverId: string): void {
        if (this.socket?.connected) {
            this.socket.emit("chat:typing:stop", { conversationId, receiverId });
        }
    }

    /**
     * Mark messages as read
     */
    markChatMessagesAsRead(conversationId: string, messageIds: string[]): void {
        if (this.socket?.connected) {
            this.socket.emit("chat:markAsRead", { conversationId, messageIds });
        }
    }

    /**
     * Mark messages as delivered
     */
    markChatMessagesAsDelivered(messageIds: string[]): void {
        if (this.socket?.connected) {
            this.socket.emit("chat:markAsDelivered", { messageIds });
        }
    }

    // ============ CHAT EVENT OBSERVABLES ============

    onChatNewMessage(): Observable<Message> {
        return this.chatNewMessage$.asObservable();
    }

    onChatMessageNotification(): Observable<{ conversationId: string; message: Message }> {
        return this.chatMessageNotification$.asObservable();
    }

    onChatTyping(): Observable<TypingIndicator> {
        return this.chatTyping$.asObservable();
    }

    onChatMessagesDelivered(): Observable<{ conversationId: string; messageIds: string[] }> {
        return this.chatMessagesDelivered$.asObservable();
    }

    onChatMessagesRead(): Observable<{ conversationId: string; messageIds: string[]; readBy: string }> {
        return this.chatMessagesRead$.asObservable();
    }

    getChatUnreadCount(): Observable<number> {
        return this.chatUnreadCount$.asObservable();
    }

    onChatJoined(): Observable<{ conversationId: string; success: boolean }> {
        return this.chatJoined$.asObservable();
    }

    /**
     * Set chat unread count
     */
    setChatUnreadCount(count: number): void {
        this.chatUnreadCount$.next(count);
    }

    // ============ WEBRTC SIGNALING METHODS ============

    /**
     * Join interview room
     */
    joinInterview(
        applicationId: string,
        interviewId: string,
        roomId: string,
        userId: string,
        role: "user" | "company" | "admin",
    ): void {
        if (this.socket?.connected) {
            this.socket.emit("join-interview", {
                applicationId,
                interviewId,
                roomId,
                userId,
                role,
            });
        } else {
            this.error$.next("Cannot join interview: Socket not connected");
        }
    }

    /**
     * Leave interview room
     */
    leaveInterview(roomId: string, userId: string): void {
        if (this.socket?.connected) {
            this.socket.emit("leave-interview", { roomId, userId });
        }
    }

    /**
     * Request connection from existing participant
     */
    requestConnection(roomId: string, to: string): void {
        if (this.socket?.connected) {
            this.socket.emit("request-connection", { roomId, to });
        }
    }

    /**
     * Send WebRTC offer
     */
    sendOffer(roomId: string, offer: RTCSessionDescriptionInit, to: string): void {
        if (this.socket?.connected) {
            this.socket.emit("webrtc-offer", { roomId, offer, to });
        }
    }

    /**
     * Send WebRTC answer
     */
    sendAnswer(roomId: string, answer: RTCSessionDescriptionInit, to: string): void {
        if (this.socket?.connected) {
            this.socket.emit("webrtc-answer", { roomId, answer, to });
        }
    }

    /**
     * Send ICE candidate
     */
    sendIceCandidate(roomId: string, candidate: RTCIceCandidateInit, to: string): void {
        if (this.socket?.connected) {
            this.socket.emit("ice-candidate", { roomId, candidate, to });
        }
    }

    /**
     * End interview for all participants
     */
    endInterview(roomId: string): void {
        if (this.socket?.connected) {
            this.socket.emit("end-interview", { roomId });
        }
    }

    // ============ WEBRTC EVENT OBSERVABLES ============

    onJoinedInterview(): Observable<JoinedInterview> {
        return this.joinedInterview$.asObservable();
    }

    onUserJoined(): Observable<UserJoined> {
        return this.userJoined$.asObservable();
    }

    onUserLeft(): Observable<UserLeft> {
        return this.userLeft$.asObservable();
    }

    onConnectionRequested(): Observable<ConnectionRequested> {
        return this.connectionRequested$.asObservable();
    }

    onWebRTCOffer(): Observable<WebRTCOffer> {
        return this.webrtcOffer$.asObservable();
    }

    onWebRTCAnswer(): Observable<WebRTCAnswer> {
        return this.webrtcAnswer$.asObservable();
    }

    onICECandidate(): Observable<ICECandidate> {
        return this.iceCandidate$.asObservable();
    }

    onInterviewEnded(): Observable<void> {
        return this.interviewEnded$.asObservable();
    }

    /**
     * Get current connection state
     */
    getConnectionState(): boolean {
        return this.connected$.value;
    }

    /**
     * Increment unread count locally
     */
    private incrementUnreadCount(): void {
        const current = this.unreadCount$.value;
        this.unreadCount$.next(current + 1);
    }

    /**
     * Decrement unread count locally
     */
    private decrementUnreadCount(): void {
        const current = this.unreadCount$.value;
        if (current > 0) {
            this.unreadCount$.next(current - 1);
        }
    }

    /**
     * Set unread count
     */
    setUnreadCount(count: number): void {
        this.unreadCount$.next(count);
    }

    getSocketId(): string | undefined {
        return this.socket?.id;
    }

    ngOnDestroy(): void {
        this.disconnect();
    }
}
