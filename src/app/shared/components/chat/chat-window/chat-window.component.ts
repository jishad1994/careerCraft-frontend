import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from "@angular/core";
import { Attachment, Conversation, Message } from "../../../../models/chat.model";
import { debounceTime, Subject, takeUntil } from "rxjs";
import { ChatService } from "../../../services/chat-service/chat.service";
import { SocketService } from "../../../services/socket-service/socket.service";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AuthStateService } from "../../../../services/authState/auth-state.service";

@Component({
    selector: "app-chat-window",
    imports: [CommonModule, FormsModule],
    templateUrl: "./chat-window.component.html",
    styleUrl: "./chat-window.component.css",
})
export class ChatWindowComponent implements OnChanges {
    @Input() conversation: Conversation | null = null;
    @ViewChild("messagesContainer") private messagesContainer!: ElementRef;
    @ViewChild("fileInput") private fileInput!: ElementRef;

    messages: Message[] = [];
    messageContent = "";
    loading = true;
    sending = false;
    uploading = false;
    currentUserId = "";
    otherParticipant: any = null;

    // Typing indicator
    isTyping = false;
    otherUserTyping = false;
    typingTimeout: any = null;

    // Pagination
    currentPage = 1;
    hasMoreMessages = true;
    loadingMore = false;

    // File upload
    selectedFile: File | null = null;
    filePreview: string | null = null;

    private destroy$ = new Subject<void>();
    private shouldScrollToBottom = true;
    private typingSubject = new Subject<void>();

    constructor(
        private chatService: ChatService,
        private socketService: SocketService,
        private authState: AuthStateService,
    ) {}

    ngOnInit(): void {
        this.authState.authState$.pipe(takeUntil(this.destroy$)).subscribe((state) => {
            if (state.user) {
                this.currentUserId = state.user.id;
            }
        });

        if (this.conversation) {
            this.otherParticipant = this.conversation.participants.find((p) => p.userId !== this.currentUserId);
            this.loadMessages();
            this.joinConversation();
            this.subscribeToSocketEvents();
            this.setupTypingDebounce();
        }
    }

    
    ngOnDestroy(): void {
        if (this.conversation) {
            this.socketService.leaveConversation(this.conversation._id);
        }
        this.destroy$.next();
        this.destroy$.complete();
    }

    joinConversation(): void {
        if (this.conversation) {
            this.socketService.joinConversation(this.conversation._id);
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes["conversation"] && this.conversation) {
            this.currentPage = 1;
            this.messages = [];
            this.loading = true;

            this.otherParticipant = this.conversation.participants.find((p) => p.userId !== this.currentUserId);

            this.loadMessages();
            this.joinConversation();
            this.subscribeToSocketEvents();
            this.setupTypingDebounce();
        }
    }

    loadMessages(): void {
        if (!this.conversation) return;

        this.loading = true;
        this.chatService
            .getMessages(this.conversation._id, this.currentPage, 50)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.success && response.data) {
                        const newMessages = response.data.reverse();

                        if (this.currentPage === 1) {
                            this.messages = newMessages;
                            this.shouldScrollToBottom = true; // scroll to bottom for first load
                        } else {
                            const previousScrollHeight = this.messagesContainer.nativeElement.scrollHeight;
                            this.messages = [...newMessages, ...this.messages];
                            // maintain scroll position after prepending
                            setTimeout(() => {
                                this.messagesContainer.nativeElement.scrollTop =
                                    this.messagesContainer.nativeElement.scrollHeight - previousScrollHeight;
                            });
                        }

                        this.hasMoreMessages = response.data.length === 50;
                        this.markMessagesAsRead();
                    }
                    this.loading = false;
                    this.loadingMore = false;
                },
                error: () => {
                    this.loading = false;
                    this.loadingMore = false;
                },
            });
    }

    loadMoreMessages(): void {
        if (this.hasMoreMessages && !this.loadingMore) {
            this.loadingMore = true;
            this.currentPage++;
            this.loadMessages();
        }
    }

    subscribeToSocketEvents(): void {
        // New message received
        this.socketService
            .onChatNewMessage()
            .pipe(takeUntil(this.destroy$))
            .subscribe((message) => {
                if (message.conversationId === this.conversation?._id) {
                    this.messages.push(message);
                    this.shouldScrollToBottom = true;

                    // Mark as read if it's from other user
                    if (message.senderId !== this.currentUserId) {
                        this.markMessagesAsRead();
                    }
                }
            });

        // Typing indicator
        this.socketService
            .onChatTyping()
            .pipe(takeUntil(this.destroy$))
            .subscribe((data) => {
                if (data.conversationId === this.conversation?._id) {
                    this.otherUserTyping = data.isTyping;

                    if (data.isTyping) {
                        this.scrollToBottom();
                    }
                }
            });

        // Messages read
        this.socketService
            .onChatMessagesRead()
            .pipe(takeUntil(this.destroy$))
            .subscribe((data) => {
                if (data.conversationId === this.conversation?._id) {
                    // Update message statuses to read
                    this.messages
                        .filter((msg) => data.messageIds.includes(msg._id))
                        .forEach((msg) => {
                            msg.status = "read";
                            msg.readAt = new Date().toISOString();
                        });
                }
            });

        // Messages delivered
        this.socketService
            .onChatMessagesDelivered()
            .pipe(takeUntil(this.destroy$))
            .subscribe((data) => {
                if (data.conversationId === this.conversation?._id) {
                    this.messages
                        .filter((msg) => data.messageIds.includes(msg._id))
                        .forEach((msg) => {
                            msg.status = "delivered";
                            msg.deliveredAt = new Date().toISOString();
                        });
                }
            });
    }

    setupTypingDebounce(): void {
        this.typingSubject.pipe(debounceTime(300), takeUntil(this.destroy$)).subscribe(() => {
            this.handleTyping();
        });
    }

    onInputChange(): void {
        this.typingSubject.next();
    }

    handleTyping(): void {
        if (!this.conversation || !this.otherParticipant) return;

        if (this.messageContent.trim() && !this.isTyping) {
            this.isTyping = true;
            this.socketService.startTyping(this.conversation._id, this.otherParticipant.userId);
        }

        // Clear existing timeout
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }

        // Stop typing after 3 seconds of no input
        this.typingTimeout = setTimeout(() => {
            if (this.isTyping) {
                this.stopTyping();
            }
        }, 3000);
    }

    stopTyping(): void {
        if (this.isTyping && this.conversation && this.otherParticipant) {
            this.isTyping = false;
            this.socketService.stopTyping(this.conversation._id, this.otherParticipant.userId);
        }
    }

    sendMessage(): void {
        if (!this.conversation || !this.messageContent.trim()) return;

        this.stopTyping();
        this.sending = true;

        const messageData = {
            conversationId: this.conversation._id,
            content: this.messageContent.trim(),
            messageType: "text" as const,
        };

        // Send via socket
        this.socketService.sendChatMessage(messageData);

        this.messageContent = "";
        this.sending = false;
    }

    handleEnter(event: Event) {
        const keyboardEvent = event as KeyboardEvent;
        if (!keyboardEvent.shiftKey) {
            keyboardEvent.preventDefault();
            this.sendMessage();
        }
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            this.selectedFile = input.files[0];

            // Create preview for images
            if (this.selectedFile.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.filePreview = e.target?.result as string;
                };
                reader.readAsDataURL(this.selectedFile);
            } else {
                this.filePreview = null;
            }
        }
    }

    async uploadAndSendFile(): Promise<void> {
        if (!this.selectedFile || !this.conversation) return;

        this.uploading = true;

        try {
            // Upload file
            const uploadResponse = await this.chatService.uploadFile(this.selectedFile, this.conversation._id).toPromise();

            if (uploadResponse?.success && uploadResponse.data) {
                // Send message with attachment
                this.socketService.sendChatMessage({
                    conversationId: this.conversation._id,
                    content: this.selectedFile.name,
                    messageType: "file",
                    attachments: [uploadResponse.data],
                });

                this.clearFileSelection();
            }
        } catch (error) {
            console.error("Error uploading file:", error);
        } finally {
            this.uploading = false;
        }
    }

    clearFileSelection(): void {
        this.selectedFile = null;
        this.filePreview = null;
        if (this.fileInput) {
            this.fileInput.nativeElement.value = "";
        }
    }

    markMessagesAsRead(): void {
        if (!this.conversation) return;

        const unreadMessageIds = this.messages
            .filter((msg) => msg.receiverId === this.currentUserId && msg.status !== "read")
            .map((msg) => msg._id);

        if (unreadMessageIds.length > 0) {
            this.socketService.markChatMessagesAsRead(this.conversation._id, unreadMessageIds);
        }
    }

    scrollToBottom(): void {
        // try {
        //     if (this.messagesContainer) {
        //         this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
        //     }
        // } catch (error) {
        //     console.error("Error scrolling to bottom:", error);
        // }

        if (this.messagesContainer) {
            setTimeout(() => {
                this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
                this.shouldScrollToBottom = true;
            });
        }
    }

    onScroll(event: Event): void {
        const element = event.target as HTMLElement;
        if (element.scrollTop === 0 && this.hasMoreMessages && !this.loadingMore) {
            this.loadMoreMessages();
        }
    }

    isMyMessage(message: Message): boolean {
        return message.senderId === this.currentUserId;
    }

    getMessageStatus(message: Message): string {
        if (!this.isMyMessage(message)) return "";

        switch (message.status) {
            case "sent":
                return "✓";
            case "delivered":
                return "✓✓";
            case "read":
                return "✓✓";
            default:
                return "";
        }
    }

    getMessageStatusColor(message: Message): string {
        if (message.status === "read") return "text-blue-600";
        return "text-gray-400";
    }

    formatTime(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        } else {
            return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        }
    }

    shouldShowDateSeparator(index: number): boolean {
        if (index === 0) return true;

        const currentDate = new Date(this.messages[index].createdAt).toDateString();
        const previousDate = new Date(this.messages[index - 1].createdAt).toDateString();

        return currentDate !== previousDate;
    }

    downloadFile(attachment: Attachment): void {
        window.open(attachment.fileUrl, "_blank");
    }

    getCurrentUserId(): string {
        return localStorage.getItem("userId") || "";
    }

    trackByMessage(index: number, message: Message): string {
        return message._id;
    }
}
