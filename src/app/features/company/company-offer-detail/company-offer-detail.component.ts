import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { OfferLetter, OfferLetterStatus } from '../../../models/offerLetter.model';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CompanyOfferLetterService } from '../../../shared/services/offerLetter-service/company/company-offer-letter.service';

@Component({
  selector: 'app-company-offer-detail',
  imports: [CommonModule],
  templateUrl: './company-offer-detail.component.html',
  styleUrl: './company-offer-detail.component.css'
})
export class CompanyOfferDetailComponent implements OnInit,OnDestroy {
private route = inject(ActivatedRoute);
private router = inject(Router);
private offerService = inject(CompanyOfferLetterService);
private snackBar = inject(MatSnackBar);

offer: OfferLetter | null = null;
    loading = false;
    verifying = false;
    downloading = false;
 
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
        this.offerService.getOffer(this.offerId).pipe(takeUntil(this.destroy$)).subscribe({
            next: (res) => {
                this.offer = res.data;
                this.loading = false;
            },
            error: () => {
                this.snackBar.open("Failed to load offer", "Close", { duration: 3000 });
                this.loading = false;
                this.router.navigate(["/company/dashboard/offers"]);
            },
        });
    }
 
    verifyOffer(): void {
        if (!confirm("Are you sure you want to verify this signed offer?")) return;
 
        this.verifying = true;
        this.offerService.verifyOffer(this.offerId).pipe(takeUntil(this.destroy$)).subscribe({
            next: (res) => {
                this.offer = res.data;
                this.verifying = false;
                this.snackBar.open("Offer verified successfully!", "Close", { duration: 3000 });
            },
            error: (err) => {
                this.verifying = false;
                this.snackBar.open(err.error?.message ?? "Failed to verify", "Close", { duration: 4000 });
            },
        });
    }
 
    downloadPdf(): void {
        this.downloading = true;
        this.offerService.downloadPdf(this.offerId).pipe(takeUntil(this.destroy$)).subscribe({
            next: (blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `offer-letter-${this.offerId}.pdf`;
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
 
    viewSignedDocument(): void {
        this.offerService.getSignedDocumentUrl(this.offerId).pipe(takeUntil(this.destroy$)).subscribe({
            next: (res) => {
                window.open(res.data.url, "_blank");
            },
            error: () => {
                this.snackBar.open("Failed to get document URL", "Close", { duration: 3000 });
            },
        });
    }
 
    goBack(): void {
        this.router.navigate(["/company/dashboard/offers"]);
    }
 
    getCandidateName(): string {
        if (!this.offer) return "";
        return `${this.offer.candidate.firstName} ${this.offer.candidate.lastName}`.trim();
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
        return new Date(date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    }
 
    formatCurrency(amount: number, currency: string): string {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency,
            maximumFractionDigits: 0,
        }).format(amount);
    }
 
    isExpired(): boolean {
        return this.offer ? new Date(this.offer.expiresAt) < new Date() : false;
    }
}
