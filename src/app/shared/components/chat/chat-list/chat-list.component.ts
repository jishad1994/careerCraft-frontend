import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Conversation } from '../../../../models/chat.model';
import { Subject, takeUntil } from 'rxjs';
import { ChatService } from '../../../services/chat-service/chat.service';
import { SocketService } from '../../../services/socket-service/socket.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-list',
  imports: [CommonModule],
  templateUrl: './chat-list.component.html',
  styleUrl: './chat-list.component.css'
})
export class ChatListComponent implements OnInit,OnDestroy {
@Output() conversationSelected = new EventEmitter<Conversation>();
 
  conversations: Conversation[] = [];
  selectedConversationId: string | null = null;
  loading = true;
  currentUserId: string = '';
  totalUnreadCount = 0;
 
  private destroy$ = new Subject<void>();
 
  constructor(
    private chatService: ChatService,
    private socketService: SocketService
  ) {}
 
  ngOnInit(): void {
    this.currentUserId = this.getCurrentUserId();
    this.loadConversations();
    this.subscribeToSocketEvents();
  }
 
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
 
  loadConversations(): void {
    this.loading = true;
    this.chatService
      .getConversations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.conversations = response.data.sort(
              (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
            this.calculateTotalUnread();
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading conversations:', error);
          this.loading = false;
        },
      });
  }
 
  subscribeToSocketEvents(): void {
    // Listen for new messages
    this.socketService
      .onChatMessageNotification()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.updateConversationWithNewMessage(data.conversationId, data.message);
      });
 
    // Listen for unread count updates
    this.socketService
      .getChatUnreadCount()
      .pipe(takeUntil(this.destroy$))
      .subscribe((count) => {
        this.totalUnreadCount = count;
      });
  }
 
  updateConversationWithNewMessage(conversationId: string, message: any): void {
    const conversation = this.conversations.find((c) => c._id === conversationId);
    
    if (conversation) {
      conversation.lastMessage = {
        content: message.content,
        senderId: message.senderId,
        createdAt: message.createdAt,
        messageType: message.messageType,
      };
      conversation.updatedAt = message.createdAt;
      
      // Increment unread if not current conversation
      if (this.selectedConversationId !== conversationId) {
        const participant = conversation.participants.find(
          (p) => p.userId === this.currentUserId
        );
        if (participant) {
          participant.unreadCount += 1;
        }
      }
      
      // Re-sort conversations
      this.conversations.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      
      this.calculateTotalUnread();
    } else {
      // New conversation, reload list
      this.loadConversations();
    }
  }
 
  selectConversation(conversation: Conversation): void {
    this.selectedConversationId = conversation._id;
    this.conversationSelected.emit(conversation);
    
    // Reset unread count for this conversation
    const participant = conversation.participants.find(
      (p) => p.userId === this.currentUserId
    );
    if (participant && participant.unreadCount > 0) {
      participant.unreadCount = 0;
      this.calculateTotalUnread();
    }
  }
 
  getOtherParticipant(conversation: Conversation): any {
    return conversation.participants.find((p) => p.userId !== this.currentUserId);
  }
 
  getUnreadCount(conversation: Conversation): number {
    const participant = conversation.participants.find(
      (p) => p.userId === this.currentUserId
    );
    return participant?.unreadCount || 0;
  }
 
  getLastMessagePreview(conversation: Conversation): string {
    if (!conversation.lastMessage) {
      return 'No messages yet';
    }
    
    if (conversation.lastMessage.messageType === 'file') {
      return '📎 File attachment';
    }
    
    return conversation.lastMessage.content.length > 50
      ? conversation.lastMessage.content.substring(0, 50) + '...'
      : conversation.lastMessage.content;
  }
 
  isLastMessageFromMe(conversation: Conversation): boolean {
    return conversation.lastMessage?.senderId === this.currentUserId;
  }
 
  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
 
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
 
  calculateTotalUnread(): void {
    this.totalUnreadCount = this.conversations.reduce((total, conv) => {
      const participant = conv.participants.find((p) => p.userId === this.currentUserId);
      return total + (participant?.unreadCount || 0);
    }, 0);
  }
 
  getCurrentUserId(): string {
    // Get from auth service or local storage
    return localStorage.getItem('userId') || '';
  }
 
  trackByConversation(index: number, conversation: Conversation): string {
    return conversation._id;
  }
}
