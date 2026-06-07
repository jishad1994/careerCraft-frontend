import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { PaginationMeta } from '../../../../models/api-response.model';
import {
  IJobApplication,
  JobApplicationStatusTypes,
} from '../../../../models/job-application/job-application.model';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { UserJobApplicationService } from '../../../../services/user/application/user-job-application.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-applications',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './user-applications.component.html',
  styleUrl: './user-applications.component.css',
})
export class UserApplicationsComponent implements OnInit, OnDestroy {
  private _applicationService = inject(UserJobApplicationService);
  router = inject(Router);
  private snackBar = inject(MatSnackBar);

  applications: IJobApplication[] = [];
  pagination: PaginationMeta | null = null;
  loading = false;
  currentPage = 1;
  pageSize = 10;

  // Filter
  statusFilter = '';

  // Statistics
  stats = {
    total: 0,
    pending: 0,
    reviewing: 0,
    shortlisted: 0,
    interviewed: 0,
    offered: 0,
    rejected: 0,
    withdrawn: 0,
    hired: 0,
  };

  destroy$ = new Subject<void>();

  ngOnInit() {
    this.loadApplications();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadApplications() {
    this.loading = true;

    this._applicationService
      .getUserApplications(this.currentPage, this.pageSize, this.statusFilter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.applications = response.data;
            this.pagination = response.pagination || null;
          }
          this.loadStatistics();
          this.loading = false;
        },
        error: (_error) => {
          this.snackBar.open('Failed to load applications', 'Close', {
            duration: 3000,
          });
          this.loading = false;
        },
      });
  }

  loadStatistics() {
    this.applications.forEach((application) => {
      this.stats.total++;
      switch (application.status) {
        case 'pending':
          this.stats.pending++;
          break;
        case 'reviewing':
          this.stats.reviewing++;
          break;
        case 'shortlisted':
          this.stats.shortlisted++;
          break;
        case 'interviewed':
          this.stats.interviewed++;
          break;
        case 'offered':
          this.stats.offered++;
          break;
        case 'rejected':
          this.stats.rejected++;
          break;
        case 'withdrawn':
          this.stats.withdrawn++;
          break;
        case 'hired':
          this.stats.hired++;
          break;
      }
    });
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadApplications();
  }

  clearFilter() {
    this.statusFilter = '';
    this.currentPage = 1;
    this.loadApplications();
  }

  changePage(page: number) {
    if (page < 1 || (this.pagination && page > this.pagination.totalPages)) {
      return;
    }
    this.currentPage = page;
    this.loadApplications();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  viewApplication(applicationId: string) {
    this.router.navigate(['user/my-applications', applicationId]);
  }

  viewJob(jobSlug: string) {
    this.router.navigate(['user/jobs', jobSlug]);
  }

  getStatusClass(status: JobApplicationStatusTypes): string {
    const classes: Record<JobApplicationStatusTypes, string> = {
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

  getStatusIcon(status: JobApplicationStatusTypes): string {
    const icons: Record<JobApplicationStatusTypes, string> = {
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

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  canWithdraw(status: string): boolean {
    return ['pending', 'reviewing'].includes(status);
  }

  currentPageLimit(pagination: PaginationMeta): number {
    return Math.min(pagination.page * pagination.limit, pagination.totalItems);
  }
}
