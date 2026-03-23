import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  InterviewReturnState,
  InterviewWithPopulated,
} from '../../../../models/job-application/job-application.model';
import { ActivatedRoute, Router } from '@angular/router';
import { InterviewService } from '../../../../services/company/interview-service/interview.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-company-interview-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './company-interview-details.component.html',
  styleUrl: './company-interview-details.component.css',
})
export class CompanyInterviewDetailsComponent implements OnInit, OnDestroy {
  interview: InterviewWithPopulated | null = null;
  loading = false;
  interviewId: string = '';

  // Modals
  showRescheduleModal = false;
  showCancelModal = false;
  showCompleteModal = false;

  // Form data
  newScheduledDate = '';
  newScheduledTime = '';
  rescheduleReason = '';
  cancelReason = '';
  completeFeedback = '';
  completeRating = 0;

  //for proper return purpose
  returnState: InterviewReturnState = {
    page: 1,
    activeTab: 'all',
    searchQuery: '',
    selectedStatuses: [],
    selectedTypes: [],
    companyId: '',
    jobId: '',
    applicationId: '',
  };

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly interviewService: InterviewService,
    private readonly snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.interviewId = params['interviewId'];

      if (this.interviewId) {
        this.loadInterview();
      }
    });

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.returnState.activeTab = params['activeTab'] || 'all';
        this.returnState.applicationId = params['applicationId'] || '';
        this.returnState.companyId = params['companyId'] || '';
        this.returnState.page = params['page'] || 1;
        this.returnState.searchQuery = params['search'] || '';
        this.returnState.selectedStatuses = params['status'] || [];
        this.returnState.selectedTypes = params['type'] || [];
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadInterview(): void {
    this.loading = true;

    this.interviewService
      .getInterviewById(this.interviewId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.interview = response.data;
          }
          this.loading = false;
        },
        error: () => {
          this.snackBar.open('Failed to load interview', 'Close', {
            duration: 3000,
          });
          this.loading = false;
          this.goBack();
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/company/dashboard/interviews'], {
      queryParams: this.returnState,
    });
  }

  viewApplication(): void {
    if (this.interview) {
      this.router.navigate([
        '/company/dashboard/applications',
        this.interview.applicationId,
      ]);
    }
  }

  // Reschedule Modal
  openRescheduleModal(): void {
    if (!this.interview) return;

    const scheduledAt = new Date(this.interview.interview.scheduledAt!);
    this.newScheduledDate = scheduledAt.toISOString().split('T')[0];
    this.newScheduledTime = scheduledAt.toTimeString().slice(0, 5);
    this.rescheduleReason = '';
    this.showRescheduleModal = true;
  }

  closeRescheduleModal(): void {
    this.showRescheduleModal = false;
    this.newScheduledDate = '';
    this.newScheduledTime = '';
    this.rescheduleReason = '';
  }

  submitReschedule(): void {
    if (!this.interview || !this.newScheduledDate || !this.newScheduledTime) {
      this.snackBar.open('Please select date and time', 'Close', {
        duration: 3000,
      });
      return;
    }

    const scheduledAt = new Date(
      `${this.newScheduledDate}T${this.newScheduledTime}`,
    );

    this.interviewService
      .rescheduleInterview(
        this.interview.applicationId,
        this.interviewId,
        this.interview.interview.round,
        scheduledAt,
        this.rescheduleReason,
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Interview rescheduled successfully', 'Close', {
            duration: 2000,
          });
          this.loadInterview();
          this.closeRescheduleModal();
        },
        error: () => {
          this.snackBar.open('Failed to reschedule interview', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  // Cancel Modal
  openCancelModal(): void {
    this.cancelReason = '';
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.cancelReason = '';
  }

  submitCancel(): void {
    if (!this.interview) return;

    this.interviewService
      .cancelInterview(
        this.interview.applicationId,
        this.interviewId,
        this.interview.interview.round,
        this.cancelReason,
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Interview cancelled successfully', 'Close', {
            duration: 2000,
          });
          this.loadInterview();
          this.closeCancelModal();
        },
        error: () => {
          this.snackBar.open('Failed to cancel interview', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  // Complete Modal
  openCompleteModal(): void {
    this.completeFeedback = this.interview?.interview.feedback || '';
    this.completeRating = this.interview?.interview.rating || 0;
    this.showCompleteModal = true;
  }

  closeCompleteModal(): void {
    this.showCompleteModal = false;
    this.completeFeedback = '';
    this.completeRating = 0;
  }

  setRating(rating: number): void {
    this.completeRating = rating;
  }

  submitComplete(): void {
    if (!this.interview) return;

    this.interviewService
      .completeInterview(
        this.interview.applicationId,
        this.interviewId,
        this.interview.interview.round,
        this.completeFeedback,
        this.completeRating,
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Interview completed successfully', 'Close', {
            duration: 2000,
          });
          this.loadInterview();
          this.closeCompleteModal();
        },
        error: () => {
          this.snackBar.open('Failed to complete interview', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  joinVideoCall(): void {
    if (this.interview && this.canJoin()) {
      this.router.navigate(
        [
          `/company/dashboard/applications`,
          this.interview.applicationId,
          `interviews`,
          this.interview.interview._id,
          `join-interview`,
        ],
        {
          state: {
            returnUrl: `company/dashboard/applications/interviews${this.interviewId}`,
          },
        },
      );
    }
  }

  canJoin(): boolean {
    if (!this.interview) return false;
    if (this.interview.interview.type !== 'video') return false;

    const status = this.interview.interview.status;
    if (status !== 'scheduled' && status !== 'rescheduled') return false;
    if (!this.interview.interview.scheduledAt) return false;

    const scheduledTime = new Date(
      this.interview.interview.scheduledAt,
    ).getTime();
    const now = Date.now();
    const fifteenMinutes = 15 * 60 * 1000;
    const oneHour = 60 * 60 * 1000;

    return (
      now >= scheduledTime - fifteenMinutes && now <= scheduledTime + oneHour
    );
  }

  canEdit(): boolean {
    if (!this.interview) return false;
    return ['scheduled', 'rescheduled'].includes(
      this.interview.interview.status,
    );
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-800 border-blue-300',
      rescheduled: 'bg-purple-100 text-purple-800 border-purple-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    };
    return classes[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatShortDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
