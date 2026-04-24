import { Component, OnInit, OnDestroy, inject } from "@angular/core";
import { Conversation, Message, MiniChat, Participant } from "../../../../models/chat.model";
import { Subject, takeUntil } from "rxjs";
import { ChatService } from "../../../services/chat-service/chat.service";
import { SocketService } from "../../../services/socket-service/socket.service";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { AuthStateService } from "../../../../services/authState/auth-state.service";

@Component({
    selector: "app-floating-chat-bar",
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: "./floating-chat-bar.component.html",
    styleUrl: "./floating-chat-bar.component.css",
})
export class FloatingChatBarComponent implements OnInit, OnDestroy {
    private chatService = inject(ChatService);
    private socketService = inject(SocketService);
    private authState = inject(AuthStateService);

    openChats: MiniChat[] = [];
    allConversations: Conversation[] = [];
    showConversationList = false;
    totalUnreadCount = 0;
    currentUserId = "";
    currentUserRole = "User";

    fullConverstaionLink=this.currentUserRole=='user'?'/user/messages':'/company/dashboard/messages'

    private readonly MAX_OPEN_CHATS = 3;
    private destroy$ = new Subject<void>();

    ngOnInit(): void {
        this.authState.authState$.pipe(takeUntil(this.destroy$)).subscribe((state) => {
            if (state.user) {
                this.currentUserId = state.user.id;
                this.currentUserRole = state.user.role;
            }
        });

        console.log(this.fullConverstaionLink)

        this.loadConversations();
        this.subscribeToSocketEvents();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadConversations(): void {
        this.chatService
            .getConversations()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.success && response.data) {
                        this.allConversations = response.data.sort(
                            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
                        );
                        this.calculateTotalUnread();
                    }
                },
                error: (error) => {
                    console.error("Error loading conversations:", error);
                },
            });
    }

    subscribeToSocketEvents(): void {
        // New message notification
        this.socketService
            .onChatMessageNotification()
            .pipe(takeUntil(this.destroy$))
            .subscribe((data) => {
                this.handleNewMessage(data.conversationId, data.message);
            });

        // Unread count update
        this.socketService
            .getChatUnreadCount()
            .pipe(takeUntil(this.destroy$))
            .subscribe((count) => {
                this.totalUnreadCount = count;
            });
    }

    handleNewMessage(conversationId: string, message: Message): void {
        // Update conversation list
        const conversation = this.allConversations.find((c) => c._id === conversationId);
        if (conversation) {
            conversation.lastMessage = {
                content: message.content,
                senderId: message.senderId,
                createdAt: message.createdAt,
                messageType: message.messageType,
            };

            // Increment unread if not in open chats
            const openChat = this.openChats.find((c) => c.conversation._id === conversationId);
            if (!openChat) {
                const participant = conversation.participants.find((p) => p.userId === this.currentUserId);
                if (participant) {
                    participant.unreadCount += 1;
                }
            } else {
                // Add message to open chat
                openChat.messages.push(message);
            }

            this.calculateTotalUnread();
        }
    }

    toggleConversationList(): void {
        this.showConversationList = !this.showConversationList;
    }

    openChat(conversation: Conversation): void {
        // Check if already open
        const existingChat = this.openChats.find((c) => c.conversation._id === conversation._id);

        if (existingChat) {
            existingChat.isOpen = true;
            this.showConversationList = false;
            return;
        }

        // Close oldest chat if max reached
        if (this.openChats.length >= this.MAX_OPEN_CHATS) {
            this.openChats.shift();
        }

        // Add new chat
        const miniChat: MiniChat = {
            conversation,
            isOpen: true,
            messages: [],
            unreadCount: this.getUnreadCount(conversation),
        };

        this.openChats.push(miniChat);
        this.loadChatMessages(miniChat);
        this.showConversationList = false;

        // Join conversation via socket
        this.socketService.joinConversation(conversation._id);
    }

    loadChatMessages(miniChat: MiniChat): void {
        this.chatService
            .getMessages(miniChat.conversation._id, 1, 20)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.success && response.data) {
                        miniChat.messages = response.data.reverse();

                        // Mark as read
                        this.markAsRead(miniChat);
                    }
                },
                error: (error) => {
                    console.error("Error loading messages:", error);
                },
            });
    }

    toggleChat(miniChat: MiniChat): void {
        miniChat.isOpen = !miniChat.isOpen;

        if (miniChat.isOpen) {
            this.markAsRead(miniChat);
        }
    }

    closeChat(miniChat: MiniChat, event: Event): void {
        event.stopPropagation();
        const index = this.openChats.indexOf(miniChat);
        if (index > -1) {
            this.socketService.leaveConversation(miniChat.conversation._id);
            this.openChats.splice(index, 1);
        }
    }

    markAsRead(miniChat: MiniChat): void {
        const unreadMessageIds = miniChat.messages
            .filter((msg) => msg.receiverId === this.currentUserId && msg.status !== "read")
            .map((msg) => msg._id);

        if (unreadMessageIds.length > 0) {
            this.socketService.markChatMessagesAsRead(miniChat.conversation._id, unreadMessageIds);
        }

        // Reset local unread count
        miniChat.unreadCount = 0;
        const conversation = this.allConversations.find((c) => c._id === miniChat.conversation._id);
        if (conversation) {
            const participant = conversation.participants.find((p) => p.userId === this.currentUserId);
            if (participant) {
                participant.unreadCount = 0;
            }
        }

        this.calculateTotalUnread();
    }

    getOtherParticipant(conversation: Conversation):Participant |undefined{
        return conversation.participants.find((p) => p.userId !== this.currentUserId);
    }

    getUnreadCount(conversation: Conversation): number {
        const participant = conversation.participants.find((p) => p.userId === this.currentUserId);
        return participant?.unreadCount || 0;
    }

    getLastMessagePreview(conversation: Conversation): string {
        if (!conversation.lastMessage) return "No messages yet";

        if (conversation.lastMessage.messageType === "file") {
            return "📎 File";
        }

        return conversation.lastMessage.content.length > 30
            ? conversation.lastMessage.content.substring(0, 30) + "..."
            : conversation.lastMessage.content;
    }

    calculateTotalUnread(): void {
        this.totalUnreadCount = this.allConversations.reduce((total, conv) => {
            const participant = conv.participants.find((p) => p.userId === this.currentUserId);
            return total + (participant?.unreadCount || 0);
        }, 0);
    }

    getCurrentUserId(): string {
        return localStorage.getItem("userId") || "";
    }

    trackByConversation(index: number, conversation: Conversation): string {
        return conversation._id;
    }

    trackByChat(index: number, chat: MiniChat): string {
        return chat.conversation._id;
    }
}
