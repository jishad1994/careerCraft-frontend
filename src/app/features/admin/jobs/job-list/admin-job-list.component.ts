import { Component } from '@angular/core';
import { PaginationMeta } from '../../../../models/api-response.model';
import { Job, JobStatus } from '../../../../models/job/job.model';
import { AdminJobService } from '../../../../services/admin/job/admin-job.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { withHttpTransferCacheOptions } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-job-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-job-list.component.html',
  styleUrl: './admin-job-list.component.css',
})
export class AdminJobListComponent {
  jobs: Job[] = [];
  pagination: PaginationMeta | null = null;
  loading = false;
  currentPage = 1;
  statusFilter = '';
  verifiedFilter = '';

  Math = Math;

  constructor(
    private _jobService: AdminJobService,
    private _router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadJobs();
  }

  loadJobs() {
    this.loading = true;
    const isVerified =
      this.verifiedFilter === 'true'
        ? true
        : this.verifiedFilter === 'false'
        ? false
        : undefined;

    this._jobService
      .getAllJobs(
        this.currentPage,
        10,
        this.statusFilter || undefined,
        isVerified
      )
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.jobs = response.data;
            this.pagination = response.pagination || null;
            this.loading = false;
          }
        },
        error: () => {
          this.snackBar.open('Failed to load jobs', 'Close', {
            duration: 3000,
          });
          this.loading = false;
        },
      });
  }

  changePage(page: number) {
    this.currentPage = page;
    this.loadJobs();
  }

  clearFilters() {
    this.statusFilter = '';
    this.verifiedFilter = '';
    this.currentPage = 1;
    this.loadJobs();
  }

  verifyJob(job: Job) {
    if (!confirm(`Verify job "${job.title}"?`)) return;

    this._jobService.verifyJob(job._id).subscribe({
      next: () => {
        this.snackBar.open('Job verified successfully', 'Close', {
          duration: 2000,
        });
        this.loadJobs();
      },
      error: () => {
        this.snackBar.open('Failed to verify job', 'Close', { duration: 3000 });
      },
    });
  }

  blockJob(job: Job) {
    if (!confirm(`Block job "${job.title}"?`)) return;

    this._jobService.blockJob(job._id).subscribe({
      next: () => {
        this.snackBar.open('Job blocked successfully', 'Close', {
          duration: 2000,
        });
        this.loadJobs();
      },
      error: () => {
        this.snackBar.open('Failed to block job', 'Close', { duration: 3000 });
      },
    });
  }

  unblockJob(job: Job) {
    if (!confirm(`Unblock job "${job.title}"?`)) return;

    this._jobService.unblockJob(job._id).subscribe({
      next: () => {
        this.snackBar.open('Job unblocked successfully', 'Close', {
          duration: 2000,
        });
        this.loadJobs();
      },
      error: () => {
        this.snackBar.open('Failed to unblock job', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  deleteJob(job: Job) {
    if (!confirm(`Delete job "${job.title}"? This action cannot be undone.`))
      return;

    this._jobService.deleteJob(job._id).subscribe({
      next: () => {
        this.snackBar.open('Job deleted successfully', 'Close', {
          duration: 2000,
        });
        this.loadJobs();
      },
      error: () => {
        this.snackBar.open('Failed to delete job', 'Close', { duration: 3000 });
      },
    });
  }

  viewJob(job: Job): void {
    this._router.navigate(['admin/dashboard/jobs', job._id]);
  }

  getStatusClass(status: JobStatus): string {
    const classes: Record<JobStatus, string> = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      closed: 'bg-red-100 text-red-800',
      expired: 'bg-red-100 text-red-800',
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }
}
