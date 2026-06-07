import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Job, JobSearchFilters } from "../../../../models/job/job.model";
import { PaginationMeta } from "../../../../models/api-response.model";
import { UserJobService } from "../../../../services/user/job/user-job.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { PublicJobsService } from "../../../../shared/services/public-jobs/public-jobs.service";

@Component({
    selector: "app-user-job-search",
    imports: [CommonModule, FormsModule],
    templateUrl: "./user-job-search.component.html",
    styleUrl: "./user-job-search.component.css",
})
export class UserJobSearchComponent implements OnInit {
    private jobService = inject(UserJobService);
    private router = inject(Router);
    private snackBar = inject(MatSnackBar);
    private readonly route = inject(ActivatedRoute);
    private readonly publicJobService = inject(PublicJobsService);

    jobs: Job[] = [];
    pagination: PaginationMeta | null = null;
    loading = false;
    currentPage = 1;

    filters: JobSearchFilters = {};

    isPublicView = false;

    ngOnInit() {
        this.isPublicView = this.route.snapshot.data["public"] === true;

        this.route.queryParams.subscribe((params) => {
            this.filters = {
                keyword: params["keyword"] || "",
                location: params["location"] || "",
                employmentType: params["employmentType"] || "",
                workMode: params["workMode"] || "",
                experienceMin: params["experienceMin"] ? Number(params["experienceMin"]) : undefined,
                experienceMax: params["experienceMax"] ? Number(params["experienceMax"]) : undefined,
                minSalary: params["minSalary"] ? Number(params["minSalary"]) : undefined,
                maxSalary: params["maxSalary"] ? Number(params["maxSalary"]) : undefined,
            };

            this.currentPage = params["page"] ? Number(params["page"]) : 1;
            this.loadJobs();
        });
    }

    searchJobs() {
        this.currentPage = 1;
        // this.loadJobs();
        this.updateQueryParams();
    }

    loadJobs() {
        this.loading = true;

        if (this.isPublicView) {
            this.publicJobService.searchJobs(this.filters, this.currentPage, 10).subscribe({
                next: (response) => {
                    if (response.data) {
                        this.jobs = response.data;
                        this.pagination = response.pagination || null;
                        this.loading = false;
                    }
                },
                error: () => {
                    this.snackBar.open("Failed to load jobs", "Close", { duration: 3000 });
                    this.loading = false;
                },
            });
            return;
        }
        this.jobService.searchJobs(this.filters, this.currentPage, 10).subscribe({
            next: (response) => {
                if (response.data) {
                    this.jobs = response.data;
                    this.pagination = response.pagination || null;
                    this.loading = false;
                }
            },
            error: () => {
                this.snackBar.open("Failed to load jobs", "Close", { duration: 3000 });
                this.loading = false;
            },
        });
    }

    changePage(page: number) {
        this.currentPage = page;
        this.loadJobs();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    viewJob(slug: string) {
        if (this.isPublicView) {
            this.router.navigate(["/jobs", slug]);
            return;
        }
        this.router.navigate(["user/jobs", slug]);
    }

    clearFilters() {
        this.filters = {};
        this.updateQueryParams();
        this.searchJobs();
    }

    private updateQueryParams(): void {
        const queryParams = {
            ...this.cleanFilters(this.filters),
            page: this.currentPage,
        };

        this.router.navigate([], {
            relativeTo: this.route,
            queryParams,
            queryParamsHandling: "",
        });
    }

    private cleanFilters(filters: JobSearchFilters): JobSearchFilters {
        const cleaned: JobSearchFilters = {};

        if (filters.keyword?.trim()) cleaned.keyword = filters.keyword.trim();
        if (filters.location?.trim()) cleaned.location = filters.location.trim();
        if (filters.employmentType) cleaned.employmentType = filters.employmentType;
        if (filters.workMode) cleaned.workMode = filters.workMode;
        if (filters.experienceMin !== undefined && filters.experienceMin !== null) {
            cleaned.experienceMin = Number(filters.experienceMin);
        }
        if (filters.experienceMax !== undefined && filters.experienceMax !== null) {
            cleaned.experienceMax = Number(filters.experienceMax);
        }
        if (filters.minSalary !== undefined && filters.minSalary !== null) {
            cleaned.minSalary = Number(filters.minSalary);
        }
        if (filters.maxSalary !== undefined && filters.maxSalary !== null) {
            cleaned.maxSalary = Number(filters.maxSalary);
        }

        return cleaned;
    }

    getTimeAgo(date: Date): string {
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
