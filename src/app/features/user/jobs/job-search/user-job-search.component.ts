import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Job, JobSearchFilters } from '../../../../models/job/job.model';
import { PaginationMeta } from '../../../../models/api-response.model';
import { UserJobService } from '../../../../services/user/job/user-job.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-job-search',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-job-search.component.html',
  styleUrl: './user-job-search.component.css',
})
export class UserJobSearchComponent implements OnInit {
  private jobService = inject(UserJobService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  jobs: Job[] = [];
  pagination: PaginationMeta | null = null;
  loading = false;
  currentPage = 1;

  filters: JobSearchFilters = {};

  ngOnInit() {
    this.searchJobs();
  }

  searchJobs() {
    this.currentPage = 1;
    this.loadJobs();
  }

  loadJobs() {
    this.loading = true;
    this.jobService.searchJobs(this.filters, this.currentPage, 10).subscribe({
      next: (response) => {
        if (response.data) {
          this.jobs = response.data;
          this.pagination = response.pagination || null;
          this.loading = false;
        }
      },
      error: () => {
        this.snackBar.open('Failed to load jobs', 'Close', { duration: 3000 });
        this.loading = false;
      },
    });
  }

  changePage(page: number) {
    this.currentPage = page;
    this.loadJobs();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  viewJob(slug: string) {
    this.router.navigate(['user/jobs', slug]);
  }

  clearFilters() {
    this.filters = {};
    this.searchJobs();
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const posted = new Date(date);
    const days = Math.floor(
      (now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  }
}
