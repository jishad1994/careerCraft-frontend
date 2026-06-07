import { Component, OnInit, OnDestroy, inject } from "@angular/core";
import {
    InterviewFilter,
    InterviewStats,
    InterviewWithPopulated,
} from "../../../../models/job-application/job-application.model";
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { InterviewService } from "../../../../services/company/interview-service/interview.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
    selector: "app-company-interview-listing",
    imports: [CommonModule, FormsModule],
    templateUrl: "./company-interview-listing.component.html",
    styleUrl: "./company-interview-listing.component.css",
})
export class CompanyInterviewListingComponent implements OnInit, OnDestroy {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly interviewService = inject(InterviewService);
    private readonly snackBar = inject(MatSnackBar);

    interviews: InterviewWithPopulated[] = [];
    stats: InterviewStats | null = null;
    loading = false;
    statsLoading = false;

    // Pagination
    page = 1;
    limit = 10;
    totalPages = 0;
    totalItems = 0;

    // Filters
    filter: InterviewFilter = {};
    selectedStatuses: string[] = [];
    selectedTypes: string[] = [];
    searchQuery = "";
    activeTab: "all" | "upcoming" | "completed" = "all";

    // Context (from route params)
    companyId: string | null = null;
    jobId: string | null = null;
    applicationId: string | null = null;

    // Options
    statusOptions = [
        { value: "scheduled", label: "Scheduled" },
        { value: "rescheduled", label: "Rescheduled" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" },
    ];

    typeOptions = [
        { value: "phone", label: "Phone" },
        { value: "video", label: "Video" },
        { value: "in-person", label: "In-Person" },
        { value: "technical", label: "Technical" },
        { value: "hr", label: "HR" },
    ];

    private readonly destroy$ = new Subject<void>();

    private readonly searchSubject$ = new Subject<string>();

    ngOnInit(): void {
        // Get context from route params
        this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
            this.companyId = params["companyId"] || null;
            this.jobId = params["jobId"] || null;
            this.applicationId = params["applicationId"] || null;

            this.page = +params["page"] || 1;
            this.activeTab = params["activeTab"] || "all";
            this.searchQuery = params["search"] || "";
            this.selectedStatuses = params["status"] ? params["status"].split(",") : [];
            this.selectedTypes = params["type"] ? params["type"].split(",") : [];

            this.initializeFilters();
            // this.loadInterviews();
            this.loadStats();
        });

        this.searchSubject$.pipe(takeUntil(this.destroy$), debounceTime(300), distinctUntilChanged()).subscribe((query) => {
            this.searchQuery = query;
            this.page = 1;
            this.loadInterviews();
        });
        this.loadInterviews();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    initializeFilters(): void {
        this.filter = {
            companyId: this.companyId || undefined,
            jobId: this.jobId || undefined,
            applicationId: this.applicationId || undefined,
        };
    }

    loadInterviews(): void {
        this.loading = true;

        const filter = this.buildFilter();

        this.interviewService
            .getAllInterviews(filter, this.page, this.limit)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.success) {
                        this.interviews = response.data || [];
                        if (response.pagination) {
                            this.totalPages = response.pagination.totalPages;
                            this.totalItems = response.pagination.totalItems;
                        }
                    }
                    this.loading = false;
                },
                error: () => {
                    this.snackBar.open("Failed to load interviews", "Close", {
                        duration: 3000,
                    });
                    this.loading = false;
                },
            });
    }

    loadStats(): void {
        this.statsLoading = true;

        const filter: Partial<InterviewFilter> = {
            companyId: this.companyId || undefined,
            jobId: this.jobId || undefined,
            applicationId: this.applicationId || undefined,
        };

        this.interviewService
            .getInterviewStats(filter)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.success && response.data) {
                        this.stats = response.data;
                    }
                    this.statsLoading = false;
                },
                error: () => {
                    this.statsLoading = false;
                },
            });
    }

    buildFilter(): InterviewFilter {
        const filter: InterviewFilter = { ...this.filter };

        if (this.selectedStatuses.length > 0) {
            filter.status = this.selectedStatuses;
        }

        if (this.selectedTypes.length > 0) {
            filter.type = this.selectedTypes;
        }

        if (this.searchQuery.trim()) {
            filter.search = this.searchQuery.trim();
        }

        // Tab filters
        if (this.activeTab === "upcoming") {
            filter.startDate = new Date();
            filter.status = ["scheduled", "rescheduled"];
        } else if (this.activeTab === "completed") {
            filter.status = ["completed"];
        }

        return filter;
    }

    setTab(tab: "all" | "upcoming" | "completed"): void {
        this.activeTab = tab;
        this.page = 1;
        this.selectedStatuses = [];
        this.loadInterviews();
    }

    toggleStatus(status: string): void {
        const index = this.selectedStatuses.indexOf(status);
        if (index > -1) {
            this.selectedStatuses.splice(index, 1);
        } else {
            this.selectedStatuses.push(status);
        }
        this.page = 1;
        this.loadInterviews();
    }

    toggleType(type: string): void {
        const index = this.selectedTypes.indexOf(type);
        if (index > -1) {
            this.selectedTypes.splice(index, 1);
        } else {
            this.selectedTypes.push(type);
        }
        this.page = 1;
        this.loadInterviews();
    }

    onSearch(): void {
        // this.page = 1;
        // this.loadInterviews();
        this.searchSubject$.next(this.searchQuery);
    }

    clearFilters(): void {
        this.selectedStatuses = [];
        this.selectedTypes = [];
        this.searchQuery = "";
        this.activeTab = "all";
        this.page = 1;
        this.loadInterviews();
    }

    goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.page = page;
            this.loadInterviews();
        }
    }

    viewInterview(interviewId: string): void {
        this.router.navigate(["/company/dashboard/interviews", interviewId], {
            // state: { returnUrl: `company/dashboard/interviews` },
            queryParams: {
                page: this.page,
                activeTab: this.activeTab,
                search: this.searchQuery,
                status: this.selectedStatuses.join(","),
                type: this.selectedTypes.join(","),
            },
        });
    }

    joinInterview(interview: InterviewWithPopulated): void {
        if (this.canJoin(interview)) {
            this.router.navigate(["/company/dashboard/interviews", interview._id]);
        }
    }

    canJoin(interview: InterviewWithPopulated): boolean {
        if (interview.interview.type !== "video") return false;
        if (interview.interview.status !== "scheduled") return false;
        if (!interview.interview.scheduledAt) return false;

        const scheduledTime = new Date(interview.interview.scheduledAt).getTime();
        const now = Date.now();
        const fifteenMinutes = 15 * 60 * 1000;

        return now >= scheduledTime - fifteenMinutes && now <= scheduledTime + 60 * 60 * 1000; // 1 hour window
    }

    goBack(): void {
        if (this.applicationId) {
            this.router.navigate(["/company/dashboard/applications", this.applicationId]);
        } else if (this.jobId) {
            this.router.navigate(["/company/dashboard/jobs", this.jobId]);
        } else {
            this.router.navigate(["/company/dashboard"]);
        }
    }

    getStatusClass(status: string): string {
        const classes: Record<string, string> = {
            scheduled: "bg-blue-100 text-blue-800 border-blue-300",
            rescheduled: "bg-purple-100 text-purple-800 border-purple-300",
            completed: "bg-green-100 text-green-800 border-green-300",
            cancelled: "bg-red-100 text-red-800 border-red-300",
        };
        return classes[status] || "bg-gray-100 text-gray-800 border-gray-300";
    }

    formatDate(date: Date | string): string {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    getPages(): number[] {
        const pages: number[] = [];
        const maxVisible = 5;

        if (this.totalPages <= maxVisible) {
            for (let i = 1; i <= this.totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (this.page <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push(this.totalPages);
            } else if (this.page >= this.totalPages - 2) {
                pages.push(1);
                for (let i = this.totalPages - 3; i <= this.totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push(this.page - 1);
                pages.push(this.page);
                pages.push(this.page + 1);
                pages.push(this.totalPages);
            }
        }

        return pages;
    }

    get endItem(): number {
        return Math.min(this.page * this.limit, this.totalItems);
    }

    get startItem(): number {
        return (this.page - 1) * this.limit + 1;
    }
}
