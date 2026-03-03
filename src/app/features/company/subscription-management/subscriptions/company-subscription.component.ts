import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  CompanySubscription,
  RemainingLimits,
} from '../../../../models/company/company-subscription.model';
import { ISubscriptionPlan } from '../../../../models/subscription-plan/subscription-plan.model';
import { CompanySubscriptionService } from '../../../../services/company/company-subscription/company-subscription.service';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-company-subscription',
  imports: [CommonModule],
  templateUrl: './company-subscription.component.html',
  styleUrl: './company-subscription.component.css',
})
export class CompanySubscriptionComponent implements OnInit, OnDestroy {
  activeSubscription: CompanySubscription | null = null;
  plans: ISubscriptionPlan[] = [];
  loading = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly subscriptionService: CompanySubscriptionService,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.loading = true;

    // Load active subscription
    this.subscriptionService
      .getActiveSubscription()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.activeSubscription = response.data;
          }
        },
        error: () => {
          this.activeSubscription = null;
        },
      });

    // Load available plans
    this.subscriptionService
      .getPlans()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.plans = response.data;
          }
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  viewCurrentSubscription(): void {
    if (this.activeSubscription) {
      this.router.navigate(['/company/dashboard/subscriptions/details', this.activeSubscription._id]);
    }
  }

  selectPlan(plan: ISubscriptionPlan): void {
    // Navigate to plan details
    this.router.navigate(['/company/dashboard/subscriptions/plan', plan._id]);
  }

  isCurrentPlan(plan: ISubscriptionPlan): boolean {
    return this.activeSubscription?.snapShot.name === plan.name;
  }

  getDaysRemaining(): number {
    if (!this.activeSubscription) return 0;
    const now = new Date();
    const end = new Date(this.activeSubscription.endDate);
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  getUsagePercentage(used: number, total: number): number {
    if (total === 0) return 0;
    return Math.min(100, (used / total) * 100);
  }

  getUsageColor(percentage: number): string {
    if (percentage >= 90) return 'bg-red-600';
    if (percentage >= 70) return 'bg-orange-600';
    return 'bg-blue-600';
  }
}
