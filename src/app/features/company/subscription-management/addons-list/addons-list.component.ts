import { Component, OnDestroy, OnInit } from "@angular/core";
import { CompanySubscription } from "../../../../models/company/company-subscription.model";
import { Subject, takeUntil } from "rxjs";
import { ISubscriptionAddonWithUsage } from "../../../../models/subscription-addons.model";
import { CompanySubscriptionService } from "../../../../services/company/company-subscription/company-subscription.service";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
    selector: "app-addons-list",
    imports: [CommonModule],
    templateUrl: "./addons-list.component.html",
    styleUrl: "./addons-list.component.css",
})
export class AddonsListComponent implements OnInit, OnDestroy {
    activeSubscription: CompanySubscription | null = null;
    availableAddons: ISubscriptionAddonWithUsage[] = [];
    groupedAddons: Record<"jobs" | "resumeViews" | "featuredJobs", ISubscriptionAddonWithUsage[]> = {
        jobs: [],
        resumeViews: [],
        featuredJobs: [],
    };

    loading = true;
    error: string | null = null;

    private readonly destroy$ = new Subject<void>();

    constructor(private readonly subscriptionService: CompanySubscriptionService, private readonly router: Router) {}

    ngOnInit(): void {
        this.checkActiveSubscription();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    checkActiveSubscription(): void {
        this.subscriptionService
            .getActiveSubscription()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.success && response.data) {
                        this.activeSubscription = response.data;
                        this.loadAvailableAddons();
                    } else {
                        this.error = "No active subscription found. Please subscribe to a plan first.";
                        this.loading = false;
                    }
                },
                error: (error) => {
                    this.error = "Failed to load subscription details";
                    this.loading = false;
                },
            });
    }

    loadAvailableAddons(): void {
        this.subscriptionService
            .getAvailableAddons()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.success && response.data) {
                        this.availableAddons = response.data;
                        this.groupAddonsByType();
                    }
                    this.loading = false;
                },
                error: (error) => {
                    this.error = "Failed to load available addons";
                    this.loading = false;
                },
            });
    }

    groupAddonsByType(): void {
        this.groupedAddons = {
            jobs: [],
            resumeViews: [],
            featuredJobs: [],
        };

        this.availableAddons.forEach((addon) => {
            if (this.groupedAddons[addon.type]) {
                this.groupedAddons[addon.type].push(addon);
            }
        });
    }

    getTypeLabel(type: string): string {
        const labels: { [key: string]: string } = {
            jobs: "Job Posts",
            resumeViews: "Resume Views",
            featuredJobs: "Featured Jobs",
        };
        return labels[type] || type;
    }

    getTypeIcon(type: string): string {
        const icons: { [key: string]: string } = {
            jobs: "briefcase",
            resumeViews: "eye",
            featuredJobs: "star",
        };
        return icons[type] || "package";
    }

    getUsagePercentage(addon: ISubscriptionAddonWithUsage): number {
        const totalLimit = addon.currentLimit + addon.currentAddonLimit;
        if (totalLimit === 0) return 0;
        return Math.min(100, (addon.currentUsage / totalLimit) * 100);
    }

    getUsageColor(percentage: number): string {
        if (percentage >= 90) return "bg-red-600";
        if (percentage >= 70) return "bg-orange-600";
        if (percentage >= 50) return "bg-yellow-600";
        return "bg-green-600";
    }

    isLimitReached(addon: ISubscriptionAddonWithUsage): boolean {
        const totalLimit = addon.currentLimit + addon.currentAddonLimit;
        return addon.currentUsage >= totalLimit;
    }

    getRemainingCount(addon: ISubscriptionAddonWithUsage): number {
        const totalLimit = addon.currentLimit + addon.currentAddonLimit;
        return Math.max(0, totalLimit - addon.currentUsage);
    }

    purchaseAddon(addon: ISubscriptionAddonWithUsage): void {
        this.router.navigate(["/company/dashboard/addons", addon._id]);
    }

    goBack(): void {
        this.router.navigate(["/company/dashboard/subscriptions"]);
    }

    getResumesViewUsage(): ISubscriptionAddonWithUsage {
        return {
            ...({} as ISubscriptionAddonWithUsage),
            currentLimit: this.activeSubscription!.snapShot.limits.resumeViews,
            currentAddonLimit: this.activeSubscription!.addonLimits?.resumeViews || 0,
            currentUsage: this.activeSubscription!.usage.resumesViewed,
        };
    }
    getJobsUsage(): ISubscriptionAddonWithUsage {
        return {
            ...({} as ISubscriptionAddonWithUsage),
            currentLimit: this.activeSubscription!.snapShot.limits.jobs,
            currentAddonLimit: this.activeSubscription!.addonLimits?.jobs || 0,
            currentUsage: this.activeSubscription!.usage.jobsPosted,
        };
    }
    getFeaturedJobsUsage(): ISubscriptionAddonWithUsage {
        return {
            ...({} as ISubscriptionAddonWithUsage),
            currentLimit: this.activeSubscription!.snapShot.limits.featuredJobs,
            currentAddonLimit: this.activeSubscription!.addonLimits?.featuredJobs || 0,
            currentUsage: this.activeSubscription!.usage.featuredUsed,
        };
    }

    getJobsUsageColor(): string {
        return this.getUsageColor(this.getUsagePercentage(this.getJobsUsage()));
    }
    getResumesViewUsageColor(): string {
        return this.getUsageColor(this.getUsagePercentage(this.getResumesViewUsage()));
    }
    getFeaturedJobsUsageColor(): string {
        return this.getUsageColor(this.getUsagePercentage(this.getFeaturedJobsUsage()));
    }
}
