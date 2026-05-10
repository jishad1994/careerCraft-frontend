import { Component, OnDestroy, OnInit, inject } from "@angular/core";
import { OfferLetter, OfferLetterStatus } from "../../../models/offerLetter.model";
import { Subject, takeUntil } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { CompanyOfferLetterService } from "../../../shared/services/offerLetter-service/company/company-offer-letter.service";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
    selector: "app-company-offer-list",
    imports: [CommonModule, FormsModule],
    templateUrl: "./company-offer-list.component.html",
    styleUrl: "./company-offer-list.component.css",
})
export class CompanyOfferListComponent implements OnInit, OnDestroy {
    private offerService = inject(CompanyOfferLetterService);
    private router = inject(Router);
    private snackBar = inject(MatSnackBar);

    offers: OfferLetter[] = [];
    loading = false;
    page = 1;
    limit = 10;
    total = 0;
    totalPages = 0;
    statusFilter = "";

    private destroy$ = new Subject<void>();

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
        this.router.navigate(["/company/dashboard/offers", id]);
    }

    createOffer(): void {
        this.router.navigate(["/company/dashboard/offers/create"]);
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

    getCandidateName(offer: OfferLetter): string {
        return `${offer.candidate.firstName} ${offer.candidate.lastName}`.trim();
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
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }
}
