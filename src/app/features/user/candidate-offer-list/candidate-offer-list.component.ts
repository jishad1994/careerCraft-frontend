import { Component, OnDestroy, OnInit } from "@angular/core";
import { OfferLetter, OfferLetterStatus } from "../../../models/offerLetter.model";
import { Subject, takeUntil } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { CandidateOfferLetterService } from "../../../shared/services/offerLetter-service/candidate/candidate-offer-letter.service";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
    selector: "app-candidate-offer-list",
    imports: [CommonModule, FormsModule],
    templateUrl: "./candidate-offer-list.component.html",
    styleUrl: "./candidate-offer-list.component.css",
})
export class CandidateOfferListComponent implements OnInit, OnDestroy {
    offers: OfferLetter[] = [];
    loading = false;
    page = 1;
    limit = 10;
    total = 0;
    totalPages = 0;
    statusFilter = "";

    private destroy$ = new Subject<void>();

    constructor(private offerService: CandidateOfferLetterService, private router: Router, private snackBar: MatSnackBar) {}

    ngOnInit(): void {
        this.loadOffers();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadOffers(): void {
        this.loading = true;
        this.offerService
            .listOffers(this.page, this.limit, this.statusFilter || undefined)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.offers = res.data;
                    if (res.pagination) {
                        this.total = res.pagination?.totalItems;
                        this.totalPages = res.pagination.totalPages;
                    }
                    this.loading = false;
                },
                error: () => {
                    this.snackBar.open("Failed to load offers", "Close", { duration: 3000 });
                    this.loading = false;
                },
            });
    }

    onFilterChange(): void {
        this.page = 1;
        this.loadOffers();
    }

    viewOffer(id: string): void {
        this.router.navigate(["/user/offers", id]);
    }

    nextPage(): void {
        if (this.page < this.totalPages) {
            this.page++;
            this.loadOffers();
        }
    }

    prevPage(): void {
        if (this.page > 1) {
            this.page--;
            this.loadOffers();
        }
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
        return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }

    isExpired(offer: OfferLetter): boolean {
        return new Date(offer.expiresAt) < new Date() && offer.status === "pending";
    }
}
