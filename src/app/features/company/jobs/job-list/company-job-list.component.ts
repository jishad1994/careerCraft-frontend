import { Component, OnInit } from '@angular/core';
import { Job } from '../../../../models/job/job.model';
import { PaginationMeta } from '../../../../models/api-response.model';
import { CompanyJobService } from '../../../../services/company/job/company-job.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-company-job-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './company-job-list.component.html',
  styleUrl: './company-job-list.component.css',
})
export class CompanyJobListComponent implements OnInit {
  jobs: Job[] = [];
  pagination: PaginationMeta | null = null;
  loading = false;
  currentPage = 1;

  constructor(
    private _jobService: CompanyJobService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadJobs();
  }

  loadJobs() {
    this.loading = true;
    this._jobService.getCompanyJobs(this.currentPage, 10).subscribe({
      next: (response) => {
        if (response.data) {
          this.jobs = response.data;
          this.pagination = response.pagination || null;
          this.loading = false;
        }
      },
      error: (error) => {
        this.snackBar.open('Failed to load jobs', 'Close', { duration: 3000 });
        this.loading = false;
      },
    });
  }

  changePage(page: number) {
    this.currentPage = page;
    this.loadJobs();
  }

  createJob() {
    this.router.navigate(['/company/dashboard/jobs/create']);
  }

  viewJob(jobId: string) {
    this.router.navigate(['/company/jobs', jobId]);
  }

  editJob(jobId: string) {
    this.router.navigate(['/company/jobs', jobId, 'edit']);
  }

  deleteJob(job: Job) {
    if (!confirm(`Delete job "${job.title}"?`)) return;

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

  getStatusClass(status: string): string {
    const classes: any = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      closed: 'bg-red-100 text-red-800',
      expired: 'bg-red-100 text-red-800',
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }
}
