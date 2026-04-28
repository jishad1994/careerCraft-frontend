import { Component, OnDestroy, OnInit, inject } from "@angular/core";
import { AdminService } from "../../../services/admin/user-management/admin.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ReusableTableComponent } from "../../../shared/components/reusable-table/reusable-table.component";
import { FormsModule } from "@angular/forms";
import { PaginationMeta } from "../../../models/api-response.model";
import { COMPANY_VERIFICATION_STATUS, ICompanyListItem } from "../../../models/company/company-profile.model";
import { CommonModule } from "@angular/common";
import { TableAction, TableColumn } from "../../../models/reusable-table-items.interface";
import { Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";

@Component({
    selector: "app-companies-table",
    imports: [ReusableTableComponent, CommonModule, FormsModule],
    templateUrl: "./companies-table.component.html",
    styleUrl: "./companies-table.component.css",
})
export class CompaniesTableComponent implements OnInit, OnDestroy {
    private readonly _adminService = inject(AdminService);
    private readonly _snackBar = inject(MatSnackBar);
    private readonly _router = inject(Router);

    title = "Companies Management";

    companies: ICompanyListItem[] = [];
    pagination: PaginationMeta | null = null;
    loading = false;

    currentPage = 1;
    pageLimit = 10;
    searchQuery = "";

    selectedStatus = "all";

    private readonly destroy$ = new Subject<void>();

    verificationStatusOptions = [
        { label: "All", value: "all" },
        { label: "Pending", value: COMPANY_VERIFICATION_STATUS.PENDING },
        { label: "Verified", value: COMPANY_VERIFICATION_STATUS.APPROVED },
        { label: "Rejected", value: COMPANY_VERIFICATION_STATUS.REJECTED },
    ];

    columns: TableColumn<ICompanyListItem>[] = [
        {
            key: "name",
            label: "Company Name",
            type: "text",
        },
        {
            key: "email",
            label: "Email",
            type: "text",
        },
        {
            key: "phone",
            label: "Phone",
            type: "text",
        },
        {
            key: "industry",
            label: "Industry",
            type: "text",
        },
        {
            key: "location",
            label: "Location",
            type: "text",
        },
        {
            key: "verificationStatus",
            label: "Verification Status",
            type: "badge",
            transform: (value: unknown) => String(value),
        },
        {
            key: "isBlocked",
            label: "Status",
            type: "badge",
            transform: (value: unknown) => (value ? "Blocked" : "Active"),
        },
    ];

    actions: TableAction<ICompanyListItem>[] = [
        {
            type: "view",
            label: "View",
            icon: "view",
        },
        {
            type: "block",
            label: "Block",
            icon: "block",
            show: (row: ICompanyListItem) => !row.isBlocked,
        },
        {
            type: "unblock",
            label: "Unblock",
            icon: "unblock",
            show: (row: ICompanyListItem) => row.isBlocked,
        },
    ];

    ngOnInit(): void {
        this.loadCompanies();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadCompanies(): void {
        this.loading = true;

        this._adminService
            .getCompanies(
                this.currentPage,
                this.pageLimit,
                this.searchQuery,
                this.selectedStatus === "all" ? "" : this.selectedStatus,
            )
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.companies = response.data ?? [];
                    this.pagination = response.pagination ?? null;
                    this.loading = false;
                },
                error: (error) => {
                    this._snackBar.open(error.error?.message || "Failed to load companies", "Close", { duration: 3000 });
                    this.loading = false;
                },
            });
    }

    onPageChange(page: number): void {
        this.currentPage = page;
        this.loadCompanies();
    }

    onStatusFilterChange(): void {
        this.currentPage = 1;
        this.loadCompanies();
    }

    onSearch(query: string): void {
        this.searchQuery = query;
        this.currentPage = 1;
        this.loadCompanies();
    }

    onActionClick(event: { type: string; row: ICompanyListItem }): void {
        const { type, row } = event;

        switch (type) {
            case "view":
                this.viewCompany(row);
                break;

            case "block":
                this.blockCompany(row);
                break;

            case "unblock":
                this.unblockCompany(row);
                break;
        }
    }

    viewCompany(company: ICompanyListItem): void {
        this._router.navigate(["/admin/dashboard/companies", company._id]);
    }

    blockCompany(company: ICompanyListItem): void {
        if (!confirm(`Are you sure you want to block ${company.name}?`)) {
            return;
        }

        this._adminService
            .blockOrUnblockCompany(company._id, true)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this._snackBar.open("Company blocked successfully", "Close", {
                        duration: 2000,
                    });
                    this.loadCompanies();
                },
                error: (error) => {
                    this._snackBar.open(error.error?.message || "Failed to block company", "Close", { duration: 3000 });
                },
            });
    }

    unblockCompany(company: ICompanyListItem): void {
        if (!confirm(`Are you sure you want to unblock ${company.name}?`)) {
            return;
        }

        this._adminService
            .blockOrUnblockCompany(company._id, false)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this._snackBar.open("Company unblocked successfully", "Close", {
                        duration: 2000,
                    });
                    this.loadCompanies();
                },
                error: (error) => {
                    this._snackBar.open(error.error?.message || "Failed to unblock company", "Close", { duration: 3000 });
                },
            });
    }
}
