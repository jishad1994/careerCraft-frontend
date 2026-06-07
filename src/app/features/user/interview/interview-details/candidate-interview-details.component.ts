import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { InterviewWithPopulated } from '../../../../models/job-application/job-application.model';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { CandidateInterviewService } from '../../../../services/user/interview/candidate-interview.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-candidate-interview-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './candidate-interview-details.component.html',
  styleUrl: './candidate-interview-details.component.css',
})
export class CandidateInterviewDetailsComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly interviewService = inject(CandidateInterviewService);
  private readonly snackBar = inject(MatSnackBar);

  interview: InterviewWithPopulated | null = null;
  loading = false;
  interviewId = '';

  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.interviewId = params['id'];
      if (this.interviewId) {
        this.loadInterview();
      }
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
    // this.location.back();
  }

  viewJob(): void {
    if (this.interview) {
      this.router.navigate(['/user/jobs', this.interview.jobSlug]);
    }
  }

  viewApplication(): void {
    if (this.interview) {
      this.router.navigate([
        '/user/my-applications',
        this.interview.applicationId,
      ]);
    }
  }

  joinVideoCall(): void {
    if (this.interview && this.canJoin()) {
      this.router.navigate([
        `/user/my-applications`,this.interview.applicationId,`interviews`,this.interview.interview._id,`join-interview`
      ]);
    }
  }

  canJoin(): boolean {
    if (!this.interview) return false;
    if (this.interview.interview.type !== 'video') return false;
    if (!['scheduled', 'rescheduled'].includes(this.interview.interview.status))
      return false;
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

  getTimeUntilInterview(): string {
    if (!this.interview?.interview.scheduledAt) return '';

    const scheduledTime = new Date(
      this.interview.interview.scheduledAt,
    ).getTime();
    const now = Date.now();
    const diff = scheduledTime - now;

    if (diff < 0) return 'Interview time has passed';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0)
      return `in ${days} day${days > 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''}`;
    if (hours > 0)
      return `in ${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    return `in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }

  isUpcoming(): boolean {
    if (!this.interview?.interview.scheduledAt) return false;
    return (
      new Date(this.interview.interview.scheduledAt).getTime() > Date.now()
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

  getDayOfWeek(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
  }
}
