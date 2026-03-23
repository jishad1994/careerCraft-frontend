import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { CompanySubscription } from "../../../../models/company/company-subscription.model";
import { ISubscriptionPlan } from "../../../../models/subscription-plan/subscription-plan.model";
import { Stripe, loadStripe, StripeElements, StripeCardElement } from "@stripe/stripe-js";
import { Subject, takeUntil } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { CompanySubscriptionService } from "../../../../services/company/company-subscription/company-subscription.service";
import { environment } from "../../../../environments/environment";
import { PaymentService } from "../../../../shared/services/payment-service/payment.service";
import Swal from "sweetalert2";
import { Invoice } from "../../../../models/invoice.model";
import { InvoiceService } from "../../../../shared/services/invoice-service/invoice.service";
import { PdfViewerComponent } from "../../../../shared/components/pdf-viewer/pdf-viewer.component";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";

type ViewMode = "current" | "plan" | "retry";

@Component({
    selector: "app-plan-details",
    imports: [CommonModule],
    templateUrl: "./plan-details.component.html",
    styleUrl: "./plan-details.component.css",
})
export class PlanDetailsComponent implements OnInit, OnDestroy {
    mode: ViewMode = "plan";

    // For viewing current subscription
    subscription: CompanySubscription | null = null;
    invoice: Invoice | null = null;

    // For selecting new plan
    plan: ISubscriptionPlan | null = null;
    activeSubscription: CompanySubscription | null = null;
    isUpgrade = false;
    isRetry = false;
    // Stripe
    stripe: Stripe | null = null;
    cardElement: StripeCardElement | null = null;
    elements: StripeElements | null = null;

    // States
    loading = true;
    processing = false;
    cancelling = false;
    paymentError: string | null = null;
    downloadingInvoice = false;

    private readonly destroy$ = new Subject<void>();

    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly subscriptionService: CompanySubscriptionService,
        private readonly paymentService: PaymentService,
        private readonly invoiceService: InvoiceService,
        private readonly dialog: MatDialog,
        private readonly _snackBar: MatSnackBar,
    ) {}

    async ngOnInit(): Promise<void> {
        const subscriptionId = this.route.snapshot.paramMap.get("id");

        if (subscriptionId) {
            this.mode = "current";
            this.loadCurrentSubscription(subscriptionId);
        } else {
            this.mode = "plan";
            const planId = this.route.snapshot.paramMap.get("planId");

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
                        // Check if subscription is pending or failed
                        if (this.subscription.status === "pending") {
                            // Check payment status
                            this.checkPaymentStatus(this.subscription.paymentId);
                        } else if (this.subscription.status === "active") {
                            // Load invoice for active subscriptions
                            this.loadInvoice(subscriptionId);
                        }
                    }
                    this.loading = false;
                },
                error: () => {
                    this.router.navigate(["/company/dashboard/subscriptions"]);
                },
            });
    }

    checkPaymentStatus(paymentId: string): void {
        this.paymentService
            .getPayment(paymentId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.success && response.data) {
                        const paymentStatus = response.data.status;

                        if (paymentStatus === "pending" || paymentStatus === "failed") {
                            this.showRetryPaymentUI();
                        }
                    }
                },
                error: (error) => {
                    console.error("Error checking payment status:", error);
                },
            });
    }

    async showRetryPaymentUI(): Promise<void> {
        // Show alert that payment is pending/failed
        const result = await Swal.fire({
            title: "Payment Required",
            html: `
                <div class="text-left">
                    <p class="text-gray-600 mb-4">Your subscription is pending payment completion.</p>
                    <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div class="flex gap-3">
                            <svg class="w-5 h-5 text-orange-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                            </svg>
                            <div>
                                <p class="text-sm font-semibold text-orange-900">Payment Not Completed</p>
                                <p class="text-xs text-orange-800 mt-1">Please complete your payment to activate the subscription.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Retry Payment",
            cancelButtonText: "Go Back",
            confirmButtonColor: "#2563eb",
            cancelButtonColor: "#6b7280",
            customClass: {
                popup: "rounded-xl",
                confirmButton: "px-6 py-2.5 rounded-lg font-semibold",
                cancelButton: "px-6 py-2.5 rounded-lg font-semibold",
            },
        });

        if (result.isConfirmed) {
            // Switch to retry mode
            this.switchToRetryMode();
        } else {
            this.router.navigate(["/company/dashboard/subscriptions"]);
        }
    }

    async switchToRetryMode(): Promise<void> {
        this.mode = "retry";
        this.isRetry = true;
        this.loading = true;

        // Load plan details from subscription snapshot
        if (this.subscription) {
            this.plan = {
                _id: this.subscription.planId.toString(),
                name: this.subscription.snapShot.name,
                price: this.subscription.snapShot.price,
                durationInDays: this.subscription.snapShot.durationInDays,
                limits: this.subscription.snapShot.limits,
                features: this.subscription.snapShot.features,
                isActive: true,
            } as ISubscriptionPlan;

            // Initialize Stripe
            this.stripe = await loadStripe(environment.STRIPE_PUBLISHABLE_KEY);
            this.loading = false;
            this.initializeStripe();
        }
    }

    loadInvoice(subscriptionId: string): void {
        this.invoiceService
            .getInvoiceBySubscription(subscriptionId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.success && response.data) {
                        this.invoice = response.data;
                    }
                },
                error: (error) => {
                    console.error("Error loading invoice:", error);
                },
            });
    }

    downloadInvoice(): void {
        if (!this.invoice) return;

        this.downloadingInvoice = true;

        this.invoiceService.downloadInvoicePDF(this.invoice._id).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `${this.invoice!.invoiceNumber}.pdf`;
                link.click();
                window.URL.revokeObjectURL(url);

                this.downloadingInvoice = false;

                Swal.fire({
                    title: "Success!",
                    text: "Invoice downloaded successfully",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false,
                });
            },
            error: (error) => {
                this.downloadingInvoice = false;
                Swal.fire({
                    title: "Error",
                    text: "Failed to download invoice",
                    icon: "error",
                    confirmButtonText: "Close",
                    confirmButtonColor: "#dc2626",
                });
            },
        });
    }

    viewInvoice(): void {
        if (!this.invoice) return;
        this.invoiceService
            .viewInvoice(this.invoice._id)

            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (blob) => {
                    this.dialog.open(PdfViewerComponent, {
                        width: "90vw",
                        maxWidth: "1200px",
                        height: "90vh",
                        data: {
                            blob,
                            fileName: this.invoice?.invoiceNumber,
                        },
                    });
                },
                error: (error) => {
                    this._snackBar.open(error.message || "Failed to load invoice", "Close", {
                        duration: 3000,
                    });
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
                        this.plan = response.data;
                        this.checkActiveSubscription();
                    } else {
                        this.router.navigate(["/company/dashboard/subscriptions"]);
                    }
                },
                error: () => {
                    this.router.navigate(["/company/dashboard/subscriptions"]);
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
        this.cardElement = this.elements.create("card", {
            style: {
                base: {
                    fontSize: "16px",
                    color: "#1f2937",
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    "::placeholder": { color: "#9ca3af" },
                    lineHeight: "24px",
                },
                invalid: {
                    color: "#dc2626",
                    iconColor: "#dc2626",
                },
            },
        });

        setTimeout(() => {
            const cardElementContainer = document.getElementById("card-element");
            if (cardElementContainer && this.cardElement) {
                this.cardElement.mount("#card-element");
                this.cardElement.on("change", (event) => {
                    this.paymentError = event.error ? event.error.message : null;
                });
            }
        }, 100);
    }

    async processPayment(): Promise<void> {
        if (!this.stripe || !this.cardElement || !this.plan) return;

        this.processing = true;
        this.paymentError = null;

        // Show loading
        Swal.fire({
            title: "Processing Payment",
            html: "Please wait while we process your payment...",
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        let intentResponse;
        try {
            if (this.mode == "plan") {
                intentResponse = await this.paymentService.createPaymentIntent(this.plan._id, this.isUpgrade).toPromise();
            } else if (this.mode == "retry") {
                if (!this.subscription) return;
                intentResponse = await this.paymentService.retryPayment(this.subscription?._id).toPromise();
            }

            if (!intentResponse?.success || !intentResponse.data) {
                throw new Error("Failed to create payment intent");
            }

            const { clientSecret, subscriptionId } = intentResponse.data;

            const { error, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
                payment_method: { card: this.cardElement },
            });

            if (error) {
                this.paymentError = error.message || "Payment failed";
                this.processing = false;

                await Swal.fire({
                    title: "Payment Failed",
                    text: error.message || "Payment failed. Please try again.",
                    icon: "error",
                    confirmButtonText: "Close",
                    confirmButtonColor: "#dc2626",
                    customClass: {
                        popup: "rounded-xl",
                        confirmButton: "px-6 py-2.5 rounded-lg font-semibold",
                    },
                });
                return;
            }

            const confirmResponse = await this.paymentService.confirmPayment(subscriptionId, paymentIntent.id).toPromise();

            if (confirmResponse?.success) {
                await Swal.fire({
                    title: "Payment Successful!",
                    html: `
            <div class="text-center">
              <p class="text-gray-600 mb-4">Your subscription to <strong>${this.plan.name}</strong> is now active!</p>
              <div class="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                <p class="text-sm font-semibold text-gray-900 mb-1">Welcome to ${this.plan.name}!</p>
                <p class="text-xs text-gray-600">Start posting jobs and finding the perfect candidates.</p>
              </div>
            </div>
          `,
                    icon: "success",
                    confirmButtonText: "View Subscription",
                    confirmButtonColor: "#2563eb",
                    customClass: {
                        popup: "rounded-xl",
                        title: "text-2xl font-bold",
                        confirmButton: "px-6 py-3 rounded-lg font-semibold",
                    },
                });

                this.router.navigate(["/company/dashboard/subscriptions"]);
            } else {
                throw new Error("Failed to confirm payment");
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Payment processing failed";
            this.paymentError = errorMessage;

            await Swal.fire({
                title: "Error",
                text: errorMessage,
                icon: "error",
                confirmButtonText: "Close",
                confirmButtonColor: "#dc2626",
                customClass: {
                    popup: "rounded-xl",
                    confirmButton: "px-6 py-2.5 rounded-lg font-semibold",
                },
            });
        } finally {
            this.processing = false;
        }
    }

    async cancelSubscription(): Promise<void> {
        if (!this.subscription) return;

        // Show warning dialog
        const result = await Swal.fire({
            title: "Cancel Subscription?",
            html: `
        <div class="text-left">
          <p class="text-gray-600 mb-4">Are you sure you want to cancel your <strong>${
              this.subscription.snapShot.name
          }</strong> subscription?</p>
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex gap-3">
              <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
              <div>
                <p class="text-sm font-semibold text-red-900">You'll lose access to all premium features</p>
                <p class="text-xs text-red-700 mt-1">Your subscription will remain active until ${new Date(
                    this.subscription.endDate,
                ).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      `,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Cancel",
            cancelButtonText: "Keep Subscription",
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            customClass: {
                popup: "rounded-xl",
                title: "text-xl font-bold",
                htmlContainer: "text-sm",
                confirmButton: "px-6 py-2.5 rounded-lg font-semibold",
                cancelButton: "px-6 py-2.5 rounded-lg font-semibold",
            },
        });

        if (result.isConfirmed) {
            this.confirmCancelSubscription();
        }
    }

    confirmCancelSubscription(): void {
        if (!this.subscription) return;

        this.cancelling = true;

        // Show loading
        Swal.fire({
            title: "Cancelling...",
            html: "Please wait while we cancel your subscription",
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        this.subscriptionService
            .cancelSubscription("")
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: async (response) => {
                    if (response.success) {
                        await Swal.fire({
                            title: "Cancelled",
                            text: "Your subscription has been cancelled successfully",
                            icon: "success",
                            confirmButtonText: "Close",
                            confirmButtonColor: "#2563eb",
                            customClass: {
                                popup: "rounded-xl",
                                confirmButton: "px-6 py-2.5 rounded-lg font-semibold",
                            },
                        });
                        this.router.navigate(["/company/dashboard/subscriptions"]);
                    }
                    this.cancelling = false;
                },
                error: async (error) => {
                    this.cancelling = false;
                    await Swal.fire({
                        title: "Error",
                        text: error.message || "Failed to cancel subscription",
                        icon: "error",
                        confirmButtonText: "Close",
                        confirmButtonColor: "#dc2626",
                        customClass: {
                            popup: "rounded-xl",
                            confirmButton: "px-6 py-2.5 rounded-lg font-semibold",
                        },
                    });
                },
            });
    }

    goBack(): void {
        this.router.navigate(["/company/dashboard/subscriptions"]);
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
        if (percentage >= 90) return "bg-red-600";
        if (percentage >= 70) return "bg-orange-600";
        return "bg-blue-600";
    }
}
