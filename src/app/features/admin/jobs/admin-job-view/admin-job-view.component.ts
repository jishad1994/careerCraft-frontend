import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';

import { Job, JobStatus } from '../../../../models/job/job.model';
import { AdminJobService } from '../../../../services/admin/job/admin-job.service';

@Component({
  selector: 'app-admin-job-view',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './admin-job-view.component.html',
})
export class AdminJobViewComponent implements OnInit, OnDestroy {
  private readonly _jobService = inject(AdminJobService);
  private readonly _snackBar = inject(MatSnackBar);
  private readonly _route = inject(ActivatedRoute);
  private readonly destroy$ = new Subject<void>();

  job: Job | null = null;
  isLoading = false;

  ngOnInit(): void {
    this._route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const jobId = params.get('id');
        if (jobId) this.loadJob(jobId);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadJob(jobId: string): void {
    this.isLoading = true;
    this._jobService
      .getJobById(jobId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.job = res.data;
          this.isLoading = false;
        },
        error: () => {
          this._snackBar.open('Failed to load job', 'Close', { duration: 3000 });
          this.isLoading = false;
        },
      });
  }

  getStatusClasses(status: JobStatus): string {
    const map: Record<JobStatus, string> = {
      active:   'bg-green-100 text-green-700 ring-green-200',
      draft:    'bg-yellow-100 text-yellow-700 ring-yellow-200',
      paused:   'bg-orange-100 text-orange-700 ring-orange-200',
      closed:   'bg-red-100 text-red-700 ring-red-200',
      expired:  'bg-gray-100 text-gray-600 ring-gray-200',
    };
    return map[status] ?? 'bg-gray-100 text-gray-600 ring-gray-200';
  }

  formatSalary(): string {
    if (!this.job?.salary) return 'Not specified';
    if (this.job.salary.isHidden) return 'Hidden';

    const { min, max, currency, period } = this.job.salary;
    if (!min && !max) return 'Not specified';

    const fmt = (n: number): string =>
      new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);

    const range = min && max ? `${fmt(min)} – ${fmt(max)}` : min ? `From ${fmt(min)}` : `Up to ${fmt(max!)}`;
    return `${currency} ${range} / ${period}`;
  }

  formatExperience(): string {
    if (!this.job?.experience) return 'Not specified';
    const { min, max } = this.job.experience;
    if (!max || max === 0) return `${min}+ years`;
    return `${min} – ${max} years`;
  }

  isExpired(): boolean {
    if (!this.job?.expiresAt) return false;
    return new Date(this.job.expiresAt) < new Date();
  }
}