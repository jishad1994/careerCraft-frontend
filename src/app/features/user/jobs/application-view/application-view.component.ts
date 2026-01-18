import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { IJobApplication } from '../../../../models/job-application/job-application.model';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserJobService } from '../../../../services/user/job/user-job.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserJobApplicationService } from '../../../../services/user/application/user-job-application.service';

@Component({
  selector: 'app-application-view',
  imports: [CommonModule, RouterModule],
  templateUrl: './application-view.component.html',
  styleUrl: './application-view.component.css',
})
export class ApplicationViewComponent {
  application: IJobApplication | null = null;
  loading = false;
  withdrawing = false;
  applicationId: string = '';
  showWithdrawConfirm = false;

  destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private _applicationService: UserJobApplicationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
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

  loadApplication() {
    this.loading = true;

    this._applicationService
      .getApplicationById(this.applicationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.application = response.data;
          }
          this.loading = false;
        },
        error: (error) => {
          this.snackBar.open('Failed to load application details', 'Close', {
            duration: 3000,
          });
          this.loading = false;
          this.router.navigate(['user/my-applications']);
        },
      });
  }

  goBack() {
    this.router.navigate(['user/my-applications']);
  }

  viewJob() {
    if (this.application) {
      this.router.navigate(['user/jobs', this.application.job.slug]);
    }
  }

  openWithdrawConfirm() {
    this.showWithdrawConfirm = true;
  }

  closeWithdrawConfirm() {
    this.showWithdrawConfirm = false;
  }

  withdrawApplication() {
    if (!this.application) return;

    this.withdrawing = true;

    this._applicationService
      .withdrawApplication(this.applicationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.snackBar.open('Application withdrawn successfully', 'Close', {
            duration: 2000,
          });
          this.withdrawing = false;
          this.showWithdrawConfirm = false;
          this.loadApplication(); // Reload to show updated status
        },
        error: (error) => {
          this.snackBar.open(
            error.error?.message || 'Failed to withdraw application',
            'Close',
            { duration: 3000 }
          );
          this.withdrawing = false;
          this.showWithdrawConfirm = false;
        },
      });
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

  canWithdraw(): boolean {
    if (!this.application) return false;
    return ['pending', 'reviewing'].includes(this.application.status);
  }

  getStatusClass(status: string): string {
    const classes: any = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      reviewing: 'bg-blue-100 text-blue-800 border-blue-300',
      shortlisted: 'bg-purple-100 text-purple-800 border-purple-300',
      interviewed: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      offered: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
      withdrawn: 'bg-gray-100 text-gray-800 border-gray-300',
      hired: 'bg-green-100 text-green-800 border-green-300',
    };
    return classes[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  }

  getStatusIcon(status: string): string {
    const icons: any = {
      pending: '⏳',
      reviewing: '👁️',
      shortlisted: '⭐',
      interviewed: '💬',
      offered: '🎉',
      rejected: '❌',
      withdrawn: '↩️',
      hired: '✅',
    };
    return icons[status] || '📄';
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatDateTime(date: Date | string): string {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const applied = new Date(date);
    const days = Math.floor(
      (now.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  }
}
