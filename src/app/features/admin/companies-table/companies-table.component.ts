import { Component, OnDestroy, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { FormsModule } from '@angular/forms';
import {
  ApiResponse,
  PaginationMeta,
} from '../../../models/api-response.model';
import {
  CompanyProfile,
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
  title = 'Companies Management';
  companies: ICompanyListItem[] = [];
  pagination: PaginationMeta | null = null;
  loading = false;
  destroy$ = new Subject<void>();

  currentPage = 1;
  pageLimit = 10;
  searchQuery = '';

  columns: TableColumn[] = [
    { key: 'name', label: 'Company Name', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'phone', label: 'Phone', type: 'text' },
    { key: 'industry', label: 'Industry', type: 'text' },
    { key: 'location', label: 'Location', type: 'text' },
    {
      key: 'isVerified',
      label: 'Verified',
      type: 'badge',
      transform: (value: boolean) => (value ? 'Verified' : 'Unverified'),
    },
    {
      key: 'isBlocked',
      label: 'status',
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

  constructor(
    private _adminService: AdminService,
    private _snackBar: MatSnackBar,
    private _router: Router
  ) {}

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
      .getCompanies(this.currentPage, this.pageLimit, this.searchQuery)
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
            { duration: 3000 }
          );
          this.loading = false;
        },
      });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadCompanies();
  }

  onSearch(query: string) {
    this.searchQuery = query;

    this.currentPage = 1;
    this.loadCompanies();
  }

  onActionClick(event: { type: string; row: any }) {
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
    this._router.navigate(['/admin/companies', company._id]);
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
          { duration: 3000 }
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
          { duration: 3000 }
        );
      },
    });
  }
}
