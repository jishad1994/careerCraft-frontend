import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CompanySubscription } from '../../../../models/company/company-subscription.model';
import { ISubscriptionPlan } from '../../../../models/subscription-plan/subscription-plan.model';

import {
  Stripe,
  loadStripe,
  StripeElements,
  StripeCardElement,
} from '@stripe/stripe-js';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanySubscriptionService } from '../../../../services/company/company-subscription/company-subscription.service';
import { environment } from '../../../../environments/environment';
import { PaymentService } from '../../../../shared/services/payment-service/payment.service';
import { MatSnackBar } from '@angular/material/snack-bar';

type ViewMode = 'current' | 'plan';

@Component({
  selector: 'app-plan-details',
  imports: [CommonModule],
  templateUrl: './plan-details.component.html',
  styleUrl: './plan-details.component.css',
})
export class PlanDetailsComponent {
  mode: ViewMode = 'plan'; // 'current' or 'plan'

  // For viewing current subscription
  subscription: CompanySubscription | null = null;

  // For selecting new plan
  plan: ISubscriptionPlan | null = null;
  activeSubscription: CompanySubscription | null = null;
  isUpgrade = false;

  // Stripe
  stripe: Stripe | null = null;
  cardElement: StripeCardElement | null = null;
  elements: StripeElements | null = null;

  // States
  loading = true;
  processing = false;
  cancelling = false;
  paymentError: string | null = null;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly subscriptionService: CompanySubscriptionService,
    private readonly paymentService: PaymentService,
    private readonly snackBar: MatSnackBar,
  ) {}

  async ngOnInit(): Promise<void> {
    // Check if viewing current subscription or selecting plan
    if (this.route.snapshot.url[1]?.path === 'details') {
      this.mode = 'current';
      const subscriptionId = this.route.snapshot.paramMap.get('id');
      if (subscriptionId) {
        this.loadCurrentSubscription(subscriptionId);
      }
    } else {
      this.mode = 'plan';
      const planId = this.route.snapshot.paramMap.get('planId');

      console.log('current plan', planId);
      if (planId) {
        this.loadPlanDetails(planId);
        this.stripe = await loadStripe(environment.STRIPE_PUBLISHABLE_KEY);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.cardElement) {
      this.cardElement.destroy();
    }
  }

  loadCurrentSubscription(subscriptionId: string): void {
    this.loading = true;
    this.subscriptionService
      .getActiveSubscription()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.subscription = response.data;
          }
          this.loading = false;
        },
        error: () => {
          this.router.navigate(['/company/dashboard/subscriptions']);
        },
      });
  }

  loadPlanDetails(planId: string): void {
    this.loading = true;

    this.subscriptionService
      .getPlanById(planId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {

            console.log('resoinse from plans',response.data)
            this.plan = response.data;
            this.checkActiveSubscription();
          } else {
            this.router.navigate(['/company/dashboard/subscriptions']);
          }
        },
        error: () => {
          this.router.navigate(['/company/dashboard/subscriptions']);
        },
      });
  }

  checkActiveSubscription(): void {
    this.subscriptionService
      .getActiveSubscription()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.activeSubscription = response.data;
            this.isUpgrade = true;
          }
          this.loading = false;
          this.initializeStripe();
        },
        error: () => {
          this.loading = false;
          this.initializeStripe();
        },
      });
  }

  initializeStripe(): void {
    if (!this.stripe || !this.plan) return;

    this.elements = this.stripe.elements();
    this.cardElement = this.elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#32325d',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          '::placeholder': { color: '#aab7c4' },
        },
        invalid: {
          color: '#fa755a',
          iconColor: '#fa755a',
        },
      },
    });

    setTimeout(() => {
      const cardElementContainer = document.getElementById('card-element');
      if (cardElementContainer && this.cardElement) {
        this.cardElement.mount('#card-element');
        this.cardElement.on('change', (event) => {
          this.paymentError = event.error ? event.error.message : null;
        });
      }
    }, 100);
  }

  async processPayment(): Promise<void> {
    if (!this.stripe || !this.cardElement || !this.plan) return;

    this.processing = true;
    this.paymentError = null;

    try {
      const intentResponse = await this.paymentService
        .createPaymentIntent(this.plan._id, this.isUpgrade)
        .toPromise();

      if (!intentResponse?.success || !intentResponse.data) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret, subscriptionId } = intentResponse.data;

      const { error, paymentIntent } = await this.stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: { card: this.cardElement },
        },
      );

      if (error) {
        this.paymentError = error.message || 'Payment failed';
        this.processing = false;
        return;
      }

      const confirmResponse = await this.paymentService
        .confirmPayment(subscriptionId, paymentIntent.id)
        .toPromise();

      if (confirmResponse?.success) {
        this.snackBar.open(
          'Payment successful! Your subscription is now active.',
          'Close',
          {
            duration: 5000,
          },
        );
        this.router.navigate(['/company/dashboard/subscriptions']);
      } else {
        throw new Error('Failed to confirm payment');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Payment processing failed';
      this.paymentError = errorMessage;
      this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
    } finally {
      this.processing = false;
    }
  }

  cancelSubscription(): void {
    const reason = prompt(
      'Please provide a reason for cancellation (optional):',
    );
    if (reason === null) return;

    this.cancelling = true;

    this.subscriptionService
      .cancelSubscription(reason || '')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open('Subscription cancelled successfully', 'Close', {
              duration: 3000,
            });
            this.router.navigate(['/company/dashboard/subscriptions']);
          }
          this.cancelling = false;
        },
        error: (error) => {
          this.snackBar.open(
            error.message || 'Failed to cancel subscription',
            'Close',
            {
              duration: 3000,
            },
          );
          this.cancelling = false;
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/company/dashboard/subscriptions']);
  }

  getDaysRemaining(): number {
    if (!this.subscription) return 0;
    const now = new Date();
    const end = new Date(this.subscription.endDate);
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
