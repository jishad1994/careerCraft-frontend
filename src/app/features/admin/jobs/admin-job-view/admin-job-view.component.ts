import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Job } from '../../../../models/job/job.model';
import { AdminJobService } from '../../../../services/admin/job/admin-job.service';

@Component({
  selector: 'app-admin-job-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-job-view.component.html',
})
export class AdminJobViewComponent implements OnInit, OnDestroy {
  job: Job | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private _jobService: AdminJobService,
    private _router: Router,
    private _snackBar: MatSnackBar,
    private _route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this._route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const jobId = params.get('id');
        if (jobId) {
          this.loadJob(jobId);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadJob(jobId: string): void {
    this._jobService
      .getJobById(jobId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.job = res.data;
        },
        error: () => {
          this._snackBar.open('Failed to load job', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  hasApplications(): boolean {
    return !!this.job && this.job.applicationsCount > 0;
  }

  viewApplications(): void {
    if (!this.job) return;

    this._router.navigate([
      '/admin/dashboard/jobs',
      this.job._id,
      'applications',
    ]);
  }
}
