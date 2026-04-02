import { Component, OnDestroy, OnInit } from "@angular/core";
import {
    InterviewFilter,
    InterviewStats,
    InterviewWithPopulated,
} from "../../../../models/job-application/job-application.model";
import { ActivatedRoute, Router } from "@angular/router";
import { InterviewService } from "../../../../services/company/interview-service/interview.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Subject, takeUntil } from "rxjs";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { CandidateInterviewService } from "../../../../services/user/interview/candidate-interview.service";

@Component({
    selector: "app-candidate-interview-listing",
    imports: [CommonModule, FormsModule],
    templateUrl: "./candidate-interview-listing.component.html",
    styleUrl: "./candidate-interview-listing.component.css",
})
export class CandidateInterviewListingComponent implements OnInit, OnDestroy {
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
    activeTab: "all" | "upcoming" | "past" = "all";

    // User context
    userId: string | null = null;

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

    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly interviewService: CandidateInterviewService,
        private readonly snackBar: MatSnackBar,
    ) {}

    ngOnInit(): void {
        this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
            this.initializeFilters();

            const applicationId = params.get("applicationId");
            if (applicationId) {
                this.filter.applicationId = applicationId;
            }
            this.loadInterviews();
            this.loadStats();
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    initializeFilters(): void {
        this.filter = {
            applicantId: this.userId || undefined, // Filter by current user
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
            applicantId: this.userId || undefined,
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
        } else if (this.activeTab === "past") {
            filter.endDate = new Date();
        }

        return filter;
    }

    setTab(tab: "all" | "upcoming" | "past"): void {
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
        this.page = 1;
        this.loadInterviews();
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
        this.router.navigate(["/user/my-applications/interviews", interviewId]);
    }

    joinInterview(interview: InterviewWithPopulated): void {
        if (this.canJoin(interview)) {
            this.router.navigate(["/user/my-applications/interviews", interview._id]);
        }
    }

    canJoin(interview: InterviewWithPopulated): boolean {
        if (interview.interview.type !== "video") return false;
        if (interview.interview.status !== "scheduled") return false;
        if (!interview.interview.scheduledAt) return false;

        const scheduledTime = new Date(interview.interview.scheduledAt).getTime();
        const now = Date.now();
        const fifteenMinutes = 15 * 60 * 1000;
        const oneHour = 60 * 60 * 1000;

        return now >= scheduledTime - fifteenMinutes && now <= scheduledTime + oneHour;
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
