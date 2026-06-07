import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit, inject } from "@angular/core";
import { ISubscriptionAddonWithUsage } from "../../../../models/subscription-addons.model";
import { loadStripe, Stripe, StripeCardElement, StripeElements } from "@stripe/stripe-js";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { CompanySubscriptionService } from "../../../../services/company/company-subscription/company-subscription.service";
import { PaymentService } from "../../../../shared/services/payment-service/payment.service";
import { environment } from "../../../../environments/environment";
import Swal from "sweetalert2";

@Component({
    selector: "app-addons-purchase",
    imports: [CommonModule],
    templateUrl: "./addons-purchase.component.html",
    styleUrl: "./addons-purchase.component.css",
})
export class AddonsPurchaseComponent implements OnInit, OnDestroy {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly subscriptionService = inject(CompanySubscriptionService);
    private readonly paymentService = inject(PaymentService);

    addon: ISubscriptionAddonWithUsage | null = null;
    addonId = "";

    // Stripe
    stripe: Stripe | null = null;
    cardElement: StripeCardElement | null = null;
    elements: StripeElements | null = null;

    // States
    loading = true;
    processing = false;
    paymentError: string | null = null;

    private readonly destroy$ = new Subject<void>();

    async ngOnInit(): Promise<void> {
        this.addonId = this.route.snapshot.paramMap.get("id") || "";

        if (!this.addonId) {
            this.router.navigate(["/company/dashboard/addons"]);
            return;
        }

        this.stripe = await loadStripe(environment.STRIPE_PUBLISHABLE_KEY);
        this.loadAddonDetails();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        if (this.cardElement) {
            this.cardElement.destroy();
        }
    }

    loadAddonDetails(): void {
        this.subscriptionService
            .getAvailableAddons()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.success && response.data) {
                        this.addon = response.data.find((a: ISubscriptionAddonWithUsage) => a._id === this.addonId) || null;

                        if (!this.addon) {
                            this.router.navigate(["/company/dashboard/addons"]);
                            return;
                        }

                        this.loading = false;
                        this.initializeStripe();
                    }
                },
                error: (_error) => {
                    Swal.fire({
                        title: "Error",
                        text: "Failed to load addon details",
                        icon: "error",
                    });
                    this.router.navigate(["/company/dashboard/addons"]);
                },
            });
    }

    initializeStripe(): void {
        if (!this.stripe) return;

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
        if (!this.stripe || !this.cardElement || !this.addon) return;

        this.processing = true;
        this.paymentError = null;

        // Show loading
        Swal.fire({
            title: "Processing Payment",
            html: "Please wait while we process your addon purchase...",
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            // Create payment intent for addon
            const intentResponse = await this.paymentService.purchaseAddon(this.addonId).toPromise();

            if (!intentResponse?.success || !intentResponse.data) {
                throw new Error("Failed to create payment intent");
            }

            const { clientSecret, paymentId } = intentResponse.data;

            // Confirm payment with Stripe
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
                });
                return;
            }

            // Confirm addon purchase on backend
            const confirmResponse = await this.paymentService.confirmAddon(paymentId, paymentIntent.id).toPromise();

            if (confirmResponse?.success) {
                await Swal.fire({
                    title: "Add-on Purchased!",
                    html: `
                        <div class="text-center">
                            <div class="mb-4">
                                <svg class="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <p class="text-gray-600 mb-2">Successfully added to your subscription!</p>
                            <div class="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                                <p class="text-lg font-semibold text-green-900">+${
                                    confirmResponse.data.addonQuantity
                                } ${this.getTypeLabel(
                        confirmResponse.data.addonType ? confirmResponse.data.addonType : "",
                    )}</p>
                                <p class="text-sm text-green-700 mt-1">Available for use immediately</p>
                            </div>
                        </div>
                    `,
                    icon: "success",
                    confirmButtonText: "View Subscription",
                    confirmButtonColor: "#2563eb",
                });

                this.router.navigate(["/company/dashboard/subscriptions"]);
            } else {
                throw new Error("Failed to confirm addon purchase");
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Addon purchase failed";
            this.paymentError = errorMessage;

            await Swal.fire({
                title: "Error",
                text: errorMessage,
                icon: "error",
                confirmButtonText: "Close",
                confirmButtonColor: "#dc2626",
            });
        } finally {
            this.processing = false;
        }
    }

    getTypeLabel(type: string): string {
        const labels: Record<string, string> = {
            jobs: "Job Posts",
            resumeViews: "Resume Views",
            featuredJobs: "Featured Jobs",
        };
        return labels[type] || type;
    }

    getTypeIcon(type: string): string {
        if (type === "jobs") return "briefcase";
        if (type === "resumeViews") return "eye";
        if (type === "featuredJobs") return "star";
        return "package";
    }

    getUsagePercentage(): number {
        if (!this.addon) return 0;
        const totalLimit = this.addon.currentLimit + this.addon.currentAddonLimit;
        if (totalLimit === 0) return 0;
        return Math.min(100, (this.addon.currentUsage / totalLimit) * 100);
    }

    getRemainingCount(): number {
        if (!this.addon) return 0;
        const totalLimit = this.addon.currentLimit + this.addon.currentAddonLimit;
        return Math.max(0, totalLimit - this.addon.currentUsage);
    }

    getNewTotal(): number {
        if (!this.addon) return 0;
        return this.addon.currentLimit + this.addon.currentAddonLimit + this.addon.quantity;
    }

    goBack(): void {
        this.router.navigate(["/company/dashboard/addons"]);
    }
}
