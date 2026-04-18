import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyJobService } from '../../../../services/company/job/company-job.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Job, JobStatus } from '../../../../models/job/job.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-company-job-view',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './company-job-view.component.html',
  styleUrl: './company-job-view.component.css',
})
export class CompanyJobViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private _jobService = inject(CompanyJobService);
  private snackBar = inject(MatSnackBar);

  job: Job | null = null;
  loading = false;
  jobId = '';

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.jobId = params['id'];
      if (this.jobId) {
        this.loadJob();
      }
    });
  }

  loadJob() {
    this.loading = true;
    this._jobService.getJobById(this.jobId).subscribe({
      next: (response) => {
        if (response.data) {
          this.job = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to load job details', 'Close', {
          duration: 3000,
        });
        this.loading = false;
        this.router.navigate(['/company/dashboard/jobs']);
      },
    });
  }

  goBack() {
    this.router.navigate(['/company/dashboard/jobs']);
  }

  editJob() {
    if (this.job && this.job.status === 'draft') {
      this.router.navigate(['/company/dashboard/jobs', this.jobId, 'edit']);
    }
  }

  changeStatus(newStatus: string) {
    if (!this.job) return;

    this._jobService.updateJobStatus(this.jobId, newStatus).subscribe({
      next: (response) => {
        this.snackBar.open('Job status updated successfully', 'Close', {
          duration: 2000,
        });
        this.loadJob();
      },
      error: (error) => {
        this.snackBar.open('Failed to update job status', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  deleteJob() {
    if (!this.job || !confirm(`Delete job "${this.job.title}"?`)) return;

    this._jobService.deleteJob(this.jobId).subscribe({
      next: () => {
        this.snackBar.open('Job deleted successfully', 'Close', {
          duration: 2000,
        });
        this.router.navigate(['/company/dashboard/jobs']);
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
      draft: 'bg-gray-100 text-gray-800 border-gray-300',
      active: 'bg-green-100 text-green-800 border-green-300',
      paused: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      closed: 'bg-red-100 text-red-800 border-red-300',
      expired: 'bg-red-100 text-red-800 border-red-300',
    };
    return classes[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  }

  canEdit(): boolean {
    return this.job?.status === 'draft';
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  ViewApplicants(id: string): void {
    this.router.navigate(['company/dashboard/jobs', id, 'applications']);
  }

  get hasApplications() {
    return !!this.job && this.job.applicationsCount > 0;
  }

  formatSalary(): string {
    if (!this.job?.salary) return 'Not specified';
    const { min, max, currency, period } = this.job.salary;
    if (min && max) {
      return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()} / ${period}`;
    }
    return 'Not specified';
  }
}
