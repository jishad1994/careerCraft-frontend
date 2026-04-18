import { Component, EventEmitter, OnDestroy, OnInit, Output, inject } from "@angular/core";
import { Conversation, Participant } from "../../../../models/chat.model";
import { Subject, takeUntil } from "rxjs";
import { ChatService } from "../../../services/chat-service/chat.service";
import { SocketService } from "../../../services/socket-service/socket.service";
import { CommonModule } from "@angular/common";
import { AuthStateService } from "../../../../services/authState/auth-state.service";

@Component({
    selector: "app-chat-list",
    imports: [CommonModule],
    templateUrl: "./chat-list.component.html",
    styleUrl: "./chat-list.component.css",
})
export class ChatListComponent implements OnInit, OnDestroy {
    private chatService = inject(ChatService);
    private socketService = inject(SocketService);
    private authStateService = inject(AuthStateService);

    @Output() conversationSelected = new EventEmitter<Conversation>();

    conversations: Conversation[] = [];
    selectedConversationId: string | null = null;
    loading = true;
    currentUserId = "";
    totalUnreadCount = 0;

    private destroy$ = new Subject<void>();

    ngOnInit(): void {
        this.listenAuth();
        this.loadConversations();
        this.subscribeToSocketEvents();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

   
    private listenAuth(): void {
        this.authStateService.authState$
            .pipe(takeUntil(this.destroy$))
            .subscribe((state) => {
                this.currentUserId = state.user?.id || "";
            });
    }

    
    loadConversations(): void {
        this.loading = true;

        this.chatService.getConversations()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (!res.success || !res.data) return;

                    this.conversations = res.data.sort(
                        (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)
                    );

                    this.calculateTotalUnread();
                },
                error: (err) => {
                    console.error("Error loading conversations:", err);
                },
                complete: () => {
                    this.loading = false;
                }
            });
    }


    private subscribeToSocketEvents(): void {
        this.socketService.onChatMessageNotification()
            .pipe(takeUntil(this.destroy$))
            .subscribe(({ conversationId, message }) => {
                this.handleIncomingMessage(conversationId, message);
            });

        this.socketService.getChatUnreadCount()
            .pipe(takeUntil(this.destroy$))
            .subscribe((count) => {
                this.totalUnreadCount = count;
            });
    }

    private handleIncomingMessage(conversationId: string, message: any): void {
        const conversation = this.conversations.find(c => c._id === conversationId);

        if (!conversation) {
            this.loadConversations();
            return;
        }

        conversation.lastMessage = {
            content: message.content,
            senderId: message.senderId,
            createdAt: message.createdAt,
            messageType: message.messageType,
        };

        conversation.updatedAt = message.createdAt;

        // update unread
        if (this.selectedConversationId !== conversationId) {
            const p = this.getParticipant(conversation);
            if (p) p.unreadCount++;
        }

        this.resortConversations();
        this.calculateTotalUnread();
    }

  
    selectConversation(conversation: Conversation): void {
        this.selectedConversationId = conversation._id;
        this.conversationSelected.emit(conversation);

        const p = this.getParticipant(conversation);
        if (p?.unreadCount) {
            p.unreadCount = 0;
            this.calculateTotalUnread();
        }
    }

  
    private participantCache = new WeakMap<Conversation, Participant | undefined>();

    getParticipant(conversation: Conversation): Participant | undefined {
        let cached = this.participantCache.get(conversation);
        if (cached) return cached;

        cached = conversation.participants.find(
            p => p.userId === this.currentUserId
        );

        this.participantCache.set(conversation, cached);
        return cached;
    }

    getOtherParticipant(conversation: Conversation): Participant | undefined {
        return conversation.participants.find(p => p.userId !== this.currentUserId);
    }

    getUnreadCount(conversation: Conversation): number {
        return this.getParticipant(conversation)?.unreadCount || 0;
    }

    isLastMessageFromMe(conversation: Conversation): boolean {
        return conversation.lastMessage?.senderId === this.currentUserId;
    }

    getLastMessagePreview(conversation: Conversation): string {
        const msg = conversation.lastMessage;
        if (!msg) return "No messages yet";

        if (msg.messageType === "file") return "📎 File attachment";

        return msg.content.length > 50
            ? msg.content.slice(0, 50) + "..."
            : msg.content;
    }

    
    calculateTotalUnread(): void {
        this.totalUnreadCount = this.conversations.reduce((sum, conv) => {
            return sum + (this.getParticipant(conv)?.unreadCount || 0);
        }, 0);
    }

    private resortConversations(): void {
        this.conversations.sort(
            (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)
        );
    }

  
    getTimeAgo(dateString: string): string {
        const diff = Date.now() - new Date(dateString).getTime();

        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (mins < 1) return "Just now";
        if (mins < 60) return `${mins}m`;
        if (hours < 24) return `${hours}h`;
        if (days < 7) return `${days}d`;

        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    }

    getInitials(name?: string): string {
        if (!name) return "?";
        return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
    }

    trackByConversation(_: number, c: Conversation): string {
        return c._id;
    }
}