import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from "@angular/core";
import { OfferLetter, OfferLetterStatus } from "../../../models/offerLetter.model";
import { Subject, takeUntil } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { CandidateOfferLetterService } from "../../../shared/services/offerLetter-service/candidate/candidate-offer-letter.service";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
    selector: "app-candidate-offer-detail",
    imports: [CommonModule, FormsModule],
    templateUrl: "./candidate-offer-detail.component.html",
    styleUrl: "./candidate-offer-detail.component.css",
})
export class CandidateOfferDetailComponent implements OnInit, OnDestroy {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private offerService = inject(CandidateOfferLetterService);
    private snackBar = inject(MatSnackBar);

    offer: OfferLetter | null = null;
    loading = false;
    responding = false;
    uploading = false;
    downloading = false;

    // Reject modal
    showRejectModal = false;
    rejectionReason = "";

    private offerId = "";
    private destroy$ = new Subject<void>();

    ngOnInit(): void {
        this.offerId = this.route.snapshot.params["id"];
        this.loadOffer();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadOffer(): void {
        this.loading = true;
        this.offerService
            .getOffer(this.offerId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.offer = res.data;
                    this.loading = false;
                },
                error: () => {
                    this.snackBar.open("Failed to load offer", "Close", { duration: 3000 });
                    this.loading = false;
                    this.router.navigate(["/user/offers"]);
                },
            });
    }

    acceptOffer(): void {
        if (!confirm("Are you sure you want to accept this offer?")) return;

        this.responding = true;
        this.offerService
            .respondToOffer(this.offerId, { action: "accept" })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.offer = res.data;
                    this.responding = false;
                    this.snackBar.open("Offer accepted! Please upload the signed document.", "Close", { duration: 4000 });
                },
                error: (err) => {
                    this.responding = false;
                    this.snackBar.open(err.error?.message ?? "Failed to accept offer", "Close", { duration: 4000 });
                },
            });
    }

    @ViewChild("rejectModal") rejectModal!: ElementRef<HTMLDialogElement>;

    openRejectModal(): void {
        this.rejectionReason = "";
        this.showRejectModal = true;

        this.rejectModal.nativeElement.showModal();

        setTimeout(() => {
            this.rejectModal.nativeElement.focus();
        });
    }

    closeRejectModal(): void {
        this.showRejectModal = false;
        this.rejectionReason = "";
        this.rejectModal.nativeElement.close();
    }

    submitReject(): void {
        this.responding = true;
        this.offerService
            .respondToOffer(this.offerId, {
                action: "reject",
                rejectionReason: this.rejectionReason || undefined,
            })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.offer = res.data;
                    this.responding = false;
                    this.closeRejectModal();
                    this.snackBar.open("Offer rejected", "Close", { duration: 3000 });
                },
                error: (err) => {
                    this.responding = false;
                    this.snackBar.open(err.error?.message ?? "Failed to reject offer", "Close", { duration: 4000 });
                },
            });
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (!input.files?.[0]) return;

        const file = input.files[0];
        if (file.type !== "application/pdf") {
            this.snackBar.open("Only PDF files are allowed", "Close", { duration: 3000 });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            this.snackBar.open("File must be less than 5MB", "Close", { duration: 3000 });
            return;
        }

        this.uploading = true;
        this.offerService
            .uploadSignedDocument(this.offerId, file)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.offer = res.data;
                    this.uploading = false;
                    this.snackBar.open("Signed document uploaded successfully!", "Close", { duration: 3000 });
                },
                error: (err) => {
                    this.uploading = false;
                    this.snackBar.open(err.error?.message ?? "Upload failed", "Close", { duration: 4000 });
                },
            });

        // Reset input
        input.value = "";
    }

    downloadPdf(): void {
        this.downloading = true;
        this.offerService
            .downloadPdf(this.offerId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (blob) => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `offer-letter-${this.offer?.company.name?.replace(/\s+/g, "_")}.pdf`;
                    a.click();
                    URL.revokeObjectURL(url);
                    this.downloading = false;
                },
                error: () => {
                    this.downloading = false;
                    this.snackBar.open("Failed to download PDF", "Close", { duration: 3000 });
                },
            });
    }

    goBack(): void {
        this.router.navigate(["/user/offers"]);
    }

    getStatusClass(status: OfferLetterStatus): string {
        const map: Record<string, string> = {
            pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
            accepted: "bg-blue-100 text-blue-800 border-blue-300",
            rejected: "bg-red-100 text-red-800 border-red-300",
            verified: "bg-green-100 text-green-800 border-green-300",
        };
        return map[status] ?? "bg-gray-100 text-gray-800 border-gray-300";
    }

    formatDate(date: string): string {
        return new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    }

    formatCurrency(amount: number, currency: string): string {
        return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
    }

    isExpired(): boolean {
        return this.offer ? new Date(this.offer.expiresAt) < new Date() : false;
    }

    canRespond(): boolean {
        return this.offer?.status === "pending" && !this.isExpired();
    }

    needsSignedUpload(): boolean {
        return this.offer?.status === "accepted" && !this.offer?.signedDocument;
    }
}
