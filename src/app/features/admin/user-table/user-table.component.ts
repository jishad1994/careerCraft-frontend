import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { AdminService } from '../../../services/admin/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, FormsModule } from '@angular/forms';
import { IUserListItem, UserProfile } from '../../../models/user/user-profile.model';
import {
  ApiResponse,
  PaginationMeta,
} from '../../../models/api-response.model';
import { CommonModule } from '@angular/common';
import {
  CompanyProfile,
  ICompanyListItem,
} from '../../../models/company/company-profile.model';
import { Router } from '@angular/router';
import {
  TableAction,
  TableColumn,
} from '../../../models/reusable-table-items.interface';
import { Subject, takeUntil } from 'rxjs';
@Component({
  selector: 'app-user-table',
  imports: [ReusableTableComponent, CommonModule, FormsModule],
  templateUrl: './user-table.component.html',
  styleUrl: './user-table.component.css',
})
export class UserTableComponent implements OnInit, OnDestroy {
  title = 'Users Management';
  users: IUserListItem[] = [];
  pagination: PaginationMeta | null = null;
  loading = false;
  destroy$ = new Subject<void>();

  currentPage = 1;
  pageLimit = 10;
  searchQuery = '';

  columns: TableColumn[] = [
    { key: 'firstName', label: 'First Name', type: 'text' },
    { key: 'lastName', label: 'Last Name', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'phone', label: 'Phone', type: 'text' },
    { key: 'role', label: 'Role', type: 'badge' },
    {
      key: 'isBlocked',
      label: 'Status',
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
    this.loadUsers();
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers() {
    this.loading = true;

    this._adminService
      .getUsers(this.currentPage, this.pageLimit, this.searchQuery)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.users = response.data;
          }
          this.pagination = response.pagination || null;
          this.loading = false;
        },
        error: (error) => {
          this._snackBar.open(
            error.error?.message || 'Failed to load users',
            'Close',
            { duration: 3000 }
          );
          this.loading = false;
        },
      });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadUsers();
  }

  onSearch(query: string) {
    this.searchQuery = query;
    this.currentPage = 1;
    this.loadUsers();
  }

  onActionClick(event: { type: string; row: IUserListItem }) {
    const { type, row } = event;

    switch (type) {
      case 'view':
        this.viewUser(row);
        break;
      case 'block':
        this.blockUser(row);
        break;
      case 'unblock':
        this.unblockUser(row);
        break;
    }
  }

  viewUser(user: IUserListItem) {
    this._router.navigate(['/admin/dashboard/users', user._id]);
  }

  blockUser(user: IUserListItem) {
    if (
      !confirm(
        `Are you sure you want to block ${user.firstName} ${user.lastName}?`
      )
    ) {
      return;
    }

    this._adminService
      .blockOrUnblockUser(user._id, true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this._snackBar.open('User blocked successfully', 'Close', {
            duration: 2000,
          });
          this.loadUsers();
        },
        error: (error) => {
          this._snackBar.open(
            error.error?.message || 'Failed to block user',
            'Close',
            { duration: 3000 }
          );
        },
      });
  }

  unblockUser(user: IUserListItem) {
    if (
      !confirm(
        `Are you sure you want to unblock ${user.firstName} ${user.lastName}?`
      )
    ) {
      return;
    }

    this._adminService
      .blockOrUnblockUser(user._id, false)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this._snackBar.open('User unblocked successfully', 'Close', {
            duration: 2000,
          });
          this.loadUsers();
        },
        error: (error) => {
          this._snackBar.open(
            error.error?.message || 'Failed to unblock user',
            'Close',
            { duration: 3000 }
          );
        },
      });
  }
}
