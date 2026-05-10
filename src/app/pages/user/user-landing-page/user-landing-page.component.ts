import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Subject, takeUntil } from "rxjs";

import { Job } from "../../../models/job/job.model";
import { UserJobService } from "../../../services/user/job/user-job.service";

@Component({
    selector: "app-user-landing-page",
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: "./user-landing-page.component.html",
    styleUrl: "./user-landing-page.component.css",
})
export class UserLandingPageComponent implements OnInit, OnDestroy {
    private readonly _jobService = inject(UserJobService);
    private readonly _router = inject(Router);
    private readonly _snackbar = inject(MatSnackBar);

    private readonly destroy$ = new Subject<void>();

    keyword = "";
    location = "";

    featuredJobs: Job[] = [];
    loadingFeaturedJobs = false;

    ngOnInit(): void {
        this.loadFeaturedJobs();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    searchJobs(): void {
        this._router.navigate(["/user/jobs"], {
            queryParams: {
                ...(this.keyword.trim() && { keyword: this.keyword.trim() }),
                ...(this.location.trim() && { location: this.location.trim() }),
            },
        });
    }

    loadFeaturedJobs(): void {
        this.loadingFeaturedJobs = true;

        this._jobService
            .getFeaturedJobs()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.featuredJobs = response.data ?? [];
                    this.loadingFeaturedJobs = false;
                },
                error: () => {
                    this.featuredJobs = [];
                    this.loadingFeaturedJobs = false;

                    this._snackbar.open("Failed to load featured jobs", "Close", {
                        duration: 3000,
                    });
                },
            });
    }

    viewJob(slug: string): void {
        this._router.navigate(["/user/jobs", slug]);
    }

    viewAllJobs(): void {
        this._router.navigate(["/user/jobs"]);
    }

    getCompanyInitial(job: Job): string {
        return job.company?.name?.charAt(0)?.toUpperCase() || "C";
    }

    getLocation(job: Job): string {
        const city = job.location?.city;
        const state = job.location?.state;
        const country = job.location?.country;

        return [city, state, country].filter(Boolean).join(", ") || "Location not specified";
    }

    getExperienceLabel(job: Job): string {
        const min = job.experience?.min;
        const max = job.experience?.max;

        if (min === 0 && !max) {
            return "Fresher";
        }

        if (max !== undefined && max !== null) {
            return `${min}-${max} years`;
        }

        return `${min}+ years`;
    }

    getSalary(job: Job): string {
        if (!job.salary || job.salary.isHidden) {
            return "Not disclosed";
        }

        const currency = job.salary.currency || "";
        const min = job.salary.min;
        const max = job.salary.max;
        const period = job.salary.period ? `/${job.salary.period}` : "";

        if (min && max) {
            return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}${period}`;
        }

        if (min) {
            return `${currency} ${min.toLocaleString()}+${period}`;
        }

        if (max) {
            return `Up to ${currency} ${max.toLocaleString()}${period}`;
        }

        return "Not disclosed";
    }

    getShortDescription(description: string): string {
        if (!description) {
            return "View this opportunity and learn more about the role.";
        }

        return description.length > 140 ? `${description.slice(0, 140)}...` : description;
    }

    getTimeAgo(date: Date | string): string {
        const now = new Date();
        const posted = new Date(date);

        const days = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24));

        if (days === 0) return "today";
        if (days === 1) return "yesterday";
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;

        return `${Math.floor(days / 30)} months ago`;
    }
}