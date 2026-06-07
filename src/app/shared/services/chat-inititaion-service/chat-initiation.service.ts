import { Injectable, inject } from '@angular/core';
import { ChatService } from '../chat-service/chat.service';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatInitiationService {
private chatService = inject(ChatService);
private router = inject(Router);

 
  /**
   * Initiate chat from application view (Company → User)
   * Called when recruiter clicks "Message" on shortlisted application
   */
  async initiateFromApplication(
    userId: string,
    jobId?: string,
    applicationId?: string
  ): Promise<void> {
    try {
      // Create or get conversation
      const response = await firstValueFrom(
        this.chatService.createConversation({
          otherUserId: userId,
          jobId,
          applicationId,
        })
      );
 
      if (response.success && response.data) {
        // Navigate to chat page with conversation selected
        this.router.navigate(['/company/dashboard/messages'], {
          queryParams: { conversationId: response.data._id },
        });
      }
    } catch (error) {
      console.error('Error initiating chat:', error);
    }
  }
 
  /**
   * Initiate chat from job application (User → Company)
   * Called when user applies for a job
   */
  async initiateFromJobApplication(
    companyId: string,
    jobId: string,
    applicationId: string
  ): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.chatService.createConversation({
          otherUserId: companyId,
          jobId,
          applicationId,
        })
      );
 
      if (response.success && response.data) {
        this.router.navigate(['/user/messages'], {
          queryParams: { conversationId: response.data._id },
        });
      }
    } catch (error) {
      console.error('Error initiating chat:', error);
    }
  }
 
  /**
   * Open existing conversation
   */
  openConversation(conversationId: string, isCompany = false): void {
    const basePath = isCompany ? '/company/dashboard/messages' : '/user/messages';
    this.router.navigate([basePath], {
      queryParams: { conversationId },
    });
  }
}
