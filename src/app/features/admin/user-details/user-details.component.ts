import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { Subject, takeUntil } from 'rxjs';
import { AdminService } from '../../../services/admin/user-management/admin.service';
import { UserProfile } from '../../../models/user/user-profile.model';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTabsModule,
    MatListModule,
  ],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.css',
})
export class UserDetailsComponent implements OnInit, OnDestroy {
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _adminService = inject(AdminService);
  private _snackBar = inject(MatSnackBar);

  user: UserProfile | null = null;
  loading = false;
  userId = '';
  blockComment = '';
  showCommentBox = false;
  destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.userId = this._route.snapshot.paramMap.get('id') || '';
    if (this.userId) {
      this.loadUserDetails();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserDetails(): void {
    this.loading = true;
    this._adminService
      .getUserById(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.user = response.data;
          }
          this.loading = false;
        },
        error: (error) => {
          this._snackBar.open(
            error.error?.message || 'Failed to load user details',
            'Close',
            { duration: 3000 }
          );
          this.loading = false;
          this._router.navigate(['/admin/dashboard/users']);
        },
      });
  }

  toggleCommentBox(): void {
    this.showCommentBox = !this.showCommentBox;
    if (!this.showCommentBox) {
      this.blockComment = '';
    }
  }

  blockUserWithComment(): void {
    if (!this.blockComment.trim()) {
      this._snackBar.open('Please provide a reason for blocking', 'Close', {
        duration: 2000,
      });
      return;
    }

    this._adminService
      .blockUserWithComment(this.userId, this.blockComment)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (_response) => {
          this._snackBar.open('User blocked successfully', 'Close', {
            duration: 2000,
          });
          this.showCommentBox = false;
          this.blockComment = '';
          this.loadUserDetails();
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

  unblockUser(): void {
    if (!this.user) return;

    const confirmed = confirm(
      `Are you sure you want to unblock ${this.user.firstName} ${this.user.lastName}?`
    );
    if (!confirmed) return;

    this._adminService
      .blockOrUnblockUser(this.userId, false)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (_response) => {
          this._snackBar.open('User unblocked successfully', 'Close', {
            duration: 2000,
          });
          this.loadUserDetails();
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

  downloadDocument(
    documentKey: string,
    fileName: string,
    _type: 'resume' | 'certificate'
  ): void {
    this._adminService
      .getDocumentSignedUrl(documentKey)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data?.url) {
            const link = document.createElement('a');
            link.href = response.data.url;
            link.target = '_blank';
            link.download = fileName;
            link.click();
          }
        },
        error: (error) => {
          this._snackBar.open(
            error.error?.message || 'Failed to download document',
            'Close',
            { duration: 3000 }
          );
        },
      });
  }

  viewDocument(documentKey: string): void {
    this._adminService
      .getDocumentSignedUrl(documentKey)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data?.url) {
            window.open(response.data.url, '_blank');
          }
        },
        error: (error) => {
          this._snackBar.open(
            error.error?.message || 'Failed to view document',
            'Close',
            { duration: 3000 }
          );
        },
      });
  }

  goBack(): void {
    this._router.navigate(['/admin/dashboard/users']);
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatDateRange(
    startDate: Date | string | undefined,
    endDate: Date | string | undefined,
    isCurrent: boolean
  ): string {
    const start = startDate
      ? new Date(startDate).toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        })
      : 'N/A';
    const end = isCurrent
      ? 'Present'
      : endDate
      ? new Date(endDate).toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        })
      : 'N/A';
    return `${start} - ${end}`;
  }

  formatFileSize(bytes: number | undefined): string {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(2)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  }

  getFileIcon(mimeType: string | undefined): string {
    if (!mimeType) return 'description';
    if (mimeType.includes('pdf')) return 'picture_as_pdf';
    if (mimeType.includes('image')) return 'image';
    if (mimeType.includes('word')) return 'description';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet'))
      return 'table_chart';
    return 'description';
  }

  getFullName(): string {
    if (!this.user) return '';
    return `${this.user.firstName} ${this.user.lastName || ''}`.trim();
  }

  toInitials(firstName: string, lastName: string | undefined): string {
    const firstletter = firstName.charAt(0).toUpperCase();

    const lastletter = lastName
      ? lastName.charAt(0).toUpperCase()
      : firstName.charAt(1).toUpperCase();

    return firstletter + lastletter;
  }
}
