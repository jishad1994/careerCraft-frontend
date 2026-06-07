import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { PublicJobsService } from "../../shared/services/public-jobs/public-jobs.service";
import { Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { Job } from "../../models/job/job.model";

@Component({
    selector: "app-common-landing-page",
    imports: [CommonModule, FormsModule],
    templateUrl: "./common-landing-page.component.html",
    styleUrl: "./common-landing-page.component.css",
})
export class CommonLandingPageComponent implements OnInit, OnDestroy {
    private readonly _publicJobService = inject(PublicJobsService);
    private readonly _router = inject(Router);
    private readonly _destroy$ = new Subject<void>();

    featuredJobs: Job[] = [];
    loadingFeaturedJobs = false;

    keyword = "";
    location = "";

    ngOnInit(): void {
        this.loadFeaturedJobs();
    }

    loadFeaturedJobs(): void {
        this.loadingFeaturedJobs = true;

        this._publicJobService
            .getFeaturedJobs()
            .pipe(takeUntil(this._destroy$))
            .subscribe({
                next: (res) => {
                    this.featuredJobs = res.data ?? [];
                    this.loadingFeaturedJobs = false;
                },
                error: () => {
                    this.featuredJobs = [];
                    this.loadingFeaturedJobs = false;
                },
            });
    }

    searchJobs(): void {
        const queryParams = {
            ...(this.keyword.trim() && { keyword: this.keyword.trim() }),
            ...(this.location.trim() && { location: this.location.trim() }),
        };

        this._router.navigate(["/jobs"], { queryParams });
    }

    viewJob(job: Job): void {
        this._router.navigate(["/jobs", job.slug || job._id]);
    }

    getCompanyInitial(job: Job): string {
        return job.company?.name?.charAt(0)?.toUpperCase() || "C";
    }

    getLocation(job: Job): string {
        const city = job.location?.city;
        const state = job.location?.state;
        const country = job.location?.country;

        return [city, state, country].filter(Boolean).join(", ");
    }

    getSalary(job: Job): string {
        if (job.salary?.isHidden) {
            return "Salary hidden";
        }

        const currency = job.salary?.currency || "";
        const min = job.salary?.min;
        const max = job.salary?.max;
        const period = job.salary?.period ? `/${job.salary.period}` : "";

        if (min && max) {
            return `${currency} ${min} - ${max}${period}`;
        }

        if (min) {
            return `${currency} ${min}+${period}`;
        }

        return "Not disclosed";
    }

    getExperienceLabel(job: Job): string {
        const min = job.experience?.min;
        const max = job.experience?.max;

        if (min === 0 && !max) {
            return "Fresher";
        }

        if (max) {
            return `${min}-${max} years`;
        }

        return `${min}+ years`;
    }

    getShortDescription(description: string): string {
        if (!description) {
            return "View this opportunity and learn more about the role.";
        }

        return description.length > 140 ? `${description.slice(0, 140)}...` : description;
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }
}
