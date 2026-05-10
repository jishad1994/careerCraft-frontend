import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { PublicJobsService } from '../../shared/services/public-jobs/public-jobs.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { Job } from '../../models/job/job.model';

@Component({
  selector: 'app-public-job-view',
  imports: [CommonModule],
  templateUrl: './public-job-view.component.html',
  styleUrl: './public-job-view.component.css'
})
export class PublicJobViewComponent implements OnInit,OnDestroy{
  private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly jobService = inject(PublicJobsService);
    private readonly snackBar = inject(MatSnackBar);

    private readonly destroy$ = new Subject<void>();

    job: Job | null = null;
    loading = false;
    jobSlug = "";

    ngOnInit(): void {
        this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
            this.jobSlug = params["slug"];

            if (this.jobSlug) {
                this.loadJob();
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadJob(): void {
        this.loading = true;

        this.jobService
            .getJobBySlug(this.jobSlug)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.data) {
                        this.job = response.data;
                    }

                    this.loading = false;
                },
                error: () => {
                    this.loading = false;

                    this.snackBar.open("Failed to load job details", "Close", {
                        duration: 3000,
                    });

                    this.router.navigate(["/jobs"]);
                },
            });
    }

    applyNow(): void {
        this.router.navigate(["/auth/login"], {
            queryParams: {
                role: "user",
                returnUrl: this.router.url,
            },
        });
    }

    goBack(): void {
        this.router.navigate(["/jobs"]);
    }

    formatSalary(): string {
        if (!this.job?.salary || this.job.salary.isHidden) {
            return "Not disclosed";
        }

        const { min, max, currency, period } = this.job.salary;

        if (min && max) {
            return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()} / ${period}`;
        }

        if (min) {
            return `${currency} ${min.toLocaleString()}+ / ${period}`;
        }

        if (max) {
            return `Up to ${currency} ${max.toLocaleString()} / ${period}`;
        }

        return "Not disclosed";
    }

    formatDate(date: Date | string): string {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }

    getTimeAgo(date: Date | string): string {
        const now = new Date();
        const posted = new Date(date);

        const days = Math.floor(
            (now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (days === 0) return "today";
        if (days === 1) return "yesterday";
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;

        return `${Math.floor(days / 30)} months ago`;
    }

    formatExperience(): string {
        if (!this.job?.experience) {
            return "Not specified";
        }

        const { min, max } = this.job.experience;

        if (min === 0 && !max) {
            return "Fresher";
        }

        if (max) {
            return `${min} - ${max} years`;
        }

        return `${min}+ years`;
    }

    getLocation(): string {
        if (!this.job?.location) {
            return "Location not specified";
        }

        const { city, state, country } = this.job.location;

        return [city, state, country].filter(Boolean).join(", ");
    }

    getCompanyInitial(): string {
        return this.job?.company?.name?.charAt(0)?.toUpperCase() || "C";
    }

    getEmploymentTypeLabel(): string {
        return this.job?.employmentType?.replace("-", " ") || "";
    }
}
