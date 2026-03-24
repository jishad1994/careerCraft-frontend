import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { IJobApplicationDetails } from '../../../../models/job-application/job-application.model';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserJobApplicationService } from '../../../../services/user/application/user-job-application.service';
import { ChatInitiationService } from '../../../../shared/services/chat-inititaion-service/chat-initiation.service';

@Component({
  selector: 'app-candidate-application-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './application-view.component.html',
  styleUrl: './application-view.component.css',
})
export class CandidateApplicationViewComponent implements OnInit, OnDestroy {
  application: IJobApplicationDetails | null = null;
  loading = false;
  withdrawing = false;
  applicationId: string = '';
  showWithdrawModal = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: UserJobApplicationService,
    private snackBar: MatSnackBar,
    private chatInitiationService: ChatInitiationService
  ) {}

  ngOnInit() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.applicationId = params['id'];
      if (this.applicationId) {
        this.loadApplication();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

 messageCompany(): void {
    if ( !this.application) return;
 
    this.chatInitiationService.initiateFromJobApplication(
      this.application?.company._id,
      this.application.jobDetails._id,
      this.applicationId
    );
  }
  

  loadApplication() {
    this.loading = true;
    this.applicationService
      .getApplicationById(this.applicationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.application = response.data;
          }
          this.loading = false;
        },
        error: () => {
          this.snackBar.open('Failed to load application', 'Close', {
            duration: 3000,
          });
          this.loading = false;
          this.router.navigate(['/user/my-applications']);
        },
      });
  }

  goBack() {
    this.router.navigate(['/user/my-applications']);
  }

  viewJob() {
    if (this.application) {
      this.router.navigate(['/user/jobs', this.application.jobDetails.slug]);
    }
  }

  viewInterviews() {
    this.router.navigate(['/user/my-applications/interviews'], {
      queryParams: { applicationId: this.applicationId },
    });
  }

  openWithdrawModal() {
    this.showWithdrawModal = true;
  }

  closeWithdrawModal() {
    this.showWithdrawModal = false;
  }

  withdrawApplication() {
    if (!this.application) return;

    this.withdrawing = true;
    this.applicationService
      .withdrawApplication(this.applicationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Application withdrawn successfully', 'Close', {
            duration: 2000,
          });
          this.withdrawing = false;
          this.closeWithdrawModal();
          this.loadApplication();
        },
        error: (error) => {
          this.snackBar.open(
            error.error?.message || 'Failed to withdraw',
            'Close',
            { duration: 3000 },
          );
          this.withdrawing = false;
        },
      });
  }

  canWithdraw(): boolean {
    return (
      this.application?.status === 'pending' ||
      this.application?.status === 'reviewing'
    );
  }

  hasInterviews(): boolean {
    return !!(
      this.application?.interviews && this.application.interviews.length > 0
    );
  }

  getUpcomingInterviewsCount(): number {
    if (!this.application?.interviews) return 0;
    const now = new Date();
    return this.application.interviews.filter(
      (i) =>
        i.scheduledAt &&
        new Date(i.scheduledAt) > now &&
        (i.status === 'scheduled' || i.status === 'rescheduled'),
    ).length;
  }

  getRecentStatusHistory() {
    if (!this.application?.statusHistory) return [];
    return this.application.statusHistory.slice(-5).reverse();
  }

  downloadResume() {
    if (this.application?.resume.signedURL) {
      window.open(this.application.resume.signedURL, '_blank');
    }
  }

  downloadCoverLetter() {
    if (this.application?.coverLetter?.fileUrl) {
      window.open(this.application.coverLetter.fileUrl, '_blank');
    }
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewing: 'bg-blue-100 text-blue-800',
      shortlisted: 'bg-purple-100 text-purple-800',
      interviewed: 'bg-indigo-100 text-indigo-800',
      offered: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      withdrawn: 'bg-gray-100 text-gray-800',
      hired: 'bg-green-600 text-white',
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  formatDateTime(date: Date | string): string {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getTimeAgo(date: Date | string): string {
    const now = new Date();
    const past = new Date(date);
    const days = Math.floor(
      (now.getTime() - past.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  }
}
