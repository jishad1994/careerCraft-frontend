import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import {
  Job,
  JobSearchFilters,
  JobStatus,
} from '../../../../models/job/job.model';
import { PaginationMeta } from '../../../../models/api-response.model';
import { CompanyJobService } from '../../../../services/company/job/company-job.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-company-job-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './company-job-list.component.html',
  styleUrl: './company-job-list.component.css',
})
export class CompanyJobListComponent implements OnInit, OnDestroy {
  private _jobService = inject(CompanyJobService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  jobs: Job[] = [];
  pagination: PaginationMeta | null = null;
  loading = false;
  currentPage = 1;
  pageSize = 10;

  searchTerm = '';
  statusFilter = '';
  employmentTypeFilter = '';
  workModeFilter = '';
  showFilters = false;
  currentPageLimit = 0;

  private searchSubject = new Subject<string>();

  // Statistics
  jobStats = {
    total: 0,
    active: 0,
    draft: 0,
    paused: 0,
    closed: 0,
  };

  ngOnInit() {
    this.searchSubject.pipe(debounceTime(500)).subscribe(() => {
      this.currentPage = 1;
      this.loadJobs();
    });

    this.loadJobs();
    this.loadStatistics();
  }

  ngOnDestroy() {
    this.searchSubject.complete();
  }

  onSearchChange() {
    this.searchSubject.next(this.searchTerm);
  }

  onFilterChange() {
    this.currentPage = 1; // Reset to first page on filter change
    this.loadJobs();
  }

  clearFilters() {
    this.searchTerm = '';
    this.statusFilter = '';
    this.employmentTypeFilter = '';
    this.workModeFilter = '';
    this.currentPage = 1;
    this.loadJobs();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  loadJobs() {
    this.loading = true;

    // Build filters object
    const filters: JobSearchFilters = {};

    if (this.searchTerm.trim()) {
      filters.keyword = this.searchTerm.trim();
    }

    if (this.statusFilter) {
      filters.status = this.statusFilter;
    }

    if (this.employmentTypeFilter) {
      filters.employmentType = this.employmentTypeFilter;
    }

    if (this.workModeFilter) {
      filters.workMode = this.workModeFilter;
    }

    this._jobService
      .getCompanyJobs(this.currentPage, this.pageSize, filters)
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.jobs = response.data;
            this.pagination = response.pagination || null;
            if (response.pagination) {
              this.currentPageLimit = Math.min(
                response.pagination.page * response.pagination.limit,
                response.pagination.totalItems
              );
            }
          }
          this.loading = false;
        },
        error: (error) => {
          this.snackBar.open('Failed to load jobs', 'Close', {
            duration: 3000,
          });
          this.loading = false;
        },
      });
  }

  loadStatistics() {
    this._jobService.getJobStatistics().subscribe({
      next: (response) => {
        if (response.data) {
          this.jobStats = response.data;
        }
      },
      error: (error) => {
        console.error('Failed to load statistics', error);
      },
    });
  }

  changePage(page: number) {
    if (page < 1 || (this.pagination && page > this.pagination.totalPages)) {
      return;
    }
    this.currentPage = page;
    this.loadJobs();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  createJob() {
    this.router.navigate(['/company/dashboard/jobs/create']);
  }

  viewJob(jobId: string) {
    this.router.navigate(['/company/dashboard/jobs', jobId]);
  }

  editJob(jobId: string) {
    this.router.navigate(['/company/dashboard/jobs', jobId, 'edit']);
  }

  deleteJob(job: Job) {
    if (!confirm(`Are you sure you want to delete "${job.title}"?`)) return;

    
    this._jobService.deleteJob(job._id).subscribe({
      next: () => {
        this.snackBar.open('Job deleted successfully', 'Close', {
          duration: 2000,
        });
        this.loadJobs();
        this.loadStatistics();
      },
      error: () => {
        this.snackBar.open('Failed to delete job', 'Close', {
          duration: 3000,
        });
      },
    });
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

  canEdit(job: Job): boolean {
    return job.status === 'draft';
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.statusFilter) count++;
    if (this.employmentTypeFilter) count++;
    if (this.workModeFilter) count++;
    return count;
  }

  hasActiveFilters(): boolean {
    return this.searchTerm.trim() !== '' || this.getActiveFiltersCount() > 0;
  }
}
