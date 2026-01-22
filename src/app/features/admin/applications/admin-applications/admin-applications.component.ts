import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';

import { AdminJobService } from '../../../../services/admin/job/admin-job.service';
import { IJobApplication } from '../../../../models/job-application/job-application.model';

@Component({
  selector: 'app-admin-applications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-applications.component.html',
})
export class AdminApplicationsComponent implements OnInit, OnDestroy {
  applications: IJobApplication[] = [];
  page = 1;
  limit = 10;
  jobId!: string;
  loading = false;

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
          this.jobId = jobId;
          this.loadApplications();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadApplications(): void {
    this.loading = true;

    this._jobService
      .getApplicationsByJob(this.jobId, this.page, this.limit)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.applications = res.data || [];
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this._snackBar.open('Failed to load applications', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  viewApplication(applicationId: string): void {
    this._router.navigate([
      '/admin/applications',
      applicationId,
    ]);
  }

  nextPage(): void {
    if (this.applications.length === this.limit) {
      this.page++;
      this.loadApplications();
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadApplications();
    }
  }
}
