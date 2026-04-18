import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { AdminService } from '../../../services/admin/user-management/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { FormsModule } from '@angular/forms';
import {
  ApiResponse,
  PaginationMeta,
} from '../../../models/api-response.model';
import {
  COMPANY_VERIFICATION_STATUS,
  CompanyProfile,
  CompanyVerificationStatus,
  ICompanyListItem,
} from '../../../models/company/company-profile.model';
import { CommonModule } from '@angular/common';
import {
  TableAction,
  TableColumn,
} from '../../../models/reusable-table-items.interface';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-companies-table',
  imports: [ReusableTableComponent, CommonModule, FormsModule],
  templateUrl: './companies-table.component.html',
  styleUrl: './companies-table.component.css',
})
export class CompaniesTableComponent implements OnInit, OnDestroy {
  private _adminService = inject(AdminService);
  private _snackBar = inject(MatSnackBar);
  private _router = inject(Router);

  title = 'Companies Management';
  companies: ICompanyListItem[] = [];
  pagination: PaginationMeta | null = null;
  loading = false;
  destroy$ = new Subject<void>();

  currentPage = 1;
  pageLimit = 10;
  searchQuery = '';

  selectedStatus = 'all';

  verificationStatusOptions = [ 
    { label: 'All', value: 'all' },
    { label: 'Pending', value: COMPANY_VERIFICATION_STATUS.PENDING },
    { label: 'Verified', value: COMPANY_VERIFICATION_STATUS.APPROVED },
    { label: 'Rejected', value: COMPANY_VERIFICATION_STATUS.REJECTED },
  ];

  columns: TableColumn[] = [
    { key: 'name', label: 'Company Name', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'phone', label: 'Phone', type: 'text' },
    { key: 'industry', label: 'Industry', type: 'text' },
    { key: 'location', label: 'Location', type: 'text' },
    {
      key: 'verificationStatus',
      label: 'Verification Status',
      type: 'badge',
      transform: (value: string) => value,
    },
    {
      key: 'isBlocked',
      label: 'IsBlocked',
      type: 'badge',
      transform: (value: boolean) => (value ? 'Blocked' : 'Active'),
    },
  ];

  actions: TableAction[] = [
    {
      type: 'view',
      label: 'View',
      icon: 'view',
    },
    {
      type: 'block',
      label: 'Block',
      icon: 'block',
      show: (row) => !row.isBlocked,
    },
    {
      type: 'unblock',
      label: 'Unblock',
      icon: 'unblock',
      show: (row) => row.isBlocked,
    },
  ];

  ngOnInit() {
    this.loadCompanies();
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCompanies() {
    this.loading = true;

    this._adminService
      .getCompanies(
        this.currentPage,
        this.pageLimit,
        this.searchQuery,
        this.selectedStatus === 'all' ? '' : this.selectedStatus,
      )
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.companies = response.data;
          }
          this.pagination = response.pagination || null;
          this.loading = false;
        },
        error: (error) => {
          this._snackBar.open(
            error.error?.message || 'Failed to load companies',
            'Close',
            { duration: 3000 },
          );
          this.loading = false;
        },
      });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadCompanies();
  }

  onStatusFilterChange() {
    this.currentPage = 1;
    this.loadCompanies();
  }

  onSearch(query: string) {
    this.searchQuery = query;

    this.currentPage = 1;
    this.loadCompanies();
  }

  onActionClick(event: { type: string; row: ICompanyListItem }) {
    const { type, row } = event;

    switch (type) {
      case 'view':
        this.viewCompany(row);
        break;
      case 'block':
        this.blockCompany(row);
        break;
      case 'unblock':
        this.unblockCompany(row);
        break;
    }
  }

  viewCompany(company: ICompanyListItem) {
    this._router.navigate(['/admin/dashboard/companies', company._id]);
  }

  blockCompany(company: ICompanyListItem) {
    if (!confirm(`Are you sure you want to block ${company.name}?`)) {
      return;
    }

    this._adminService.blockOrUnblockCompany(company._id, true).subscribe({
      next: () => {
        this._snackBar.open('Company blocked successfully', 'Close', {
          duration: 2000,
        });
        this.loadCompanies();
      },
      error: (error) => {
        this._snackBar.open(
          error.error?.message || 'Failed to block company',
          'Close',
          { duration: 3000 },
        );
      },
    });
  }

  unblockCompany(company: ICompanyListItem) {
    if (!confirm(`Are you sure you want to unblock ${company.name}?`)) {
      return;
    }

    this._adminService.blockOrUnblockCompany(company._id, false).subscribe({
      next: () => {
        this._snackBar.open('Company unblocked successfully', 'Close', {
          duration: 2000,
        });
        this.loadCompanies();
      },
      error: (error) => {
        this._snackBar.open(
          error.error?.message || 'Failed to unblock company',
          'Close',
          { duration: 3000 },
        );
      },
    });
  }
}
