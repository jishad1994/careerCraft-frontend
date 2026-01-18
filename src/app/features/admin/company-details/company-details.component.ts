import { Component, OnDestroy, OnInit } from '@angular/core';
import { CompanyProfile } from '../../../models/company/company-profile.model';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../../services/admin/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-company-details',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatDialogModule,
  ],
  templateUrl: './company-details.component.html',
  styleUrl: './company-details.component.css',
})
export class CompanyDetailsComponent implements OnInit, OnDestroy {
  company: CompanyProfile | null = null;
  loading = false;
  companyId: string = '';
  rejectionComment = '';
  showCommentBox = false;
  destroy$ = new Subject<void>();

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _adminService: AdminService,
    private _snackBar: MatSnackBar,
    private _dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.companyId = this._route.snapshot.paramMap.get('id') || '';
    if (this.companyId) {
      this.loadCompanyDetails();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCompanyDetails(): void {
    this.loading = true;
    this._adminService
      .getCompanyById(this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.company = response.data;
          }
          this.loading = false;
        },
        error: (error) => {
          this._snackBar.open(
            error.error?.message || 'Failed to load company details',
            'Close',
            { duration: 3000 }
          );
          this.loading = false;
          this._router.navigate(['/admin/dashboard/companies']);
        },
      });
  }

  verifyCompany(): void {
    if (!this.company) return;

    const confirmed = confirm(
      `Are you sure you want to verify ${this.company.name}?`
    );
    if (!confirmed) return;

    this._adminService
      .verifyCompany(this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this._snackBar.open('Company verified successfully', 'Close', {
            duration: 2000,
          });
          this.loadCompanyDetails();
        },
        error: (error) => {
          this._snackBar.open(
            error.error?.message || 'Failed to verify company',
            'Close',
            { duration: 3000 }
          );
        },
      });
  }

  toggleCommentBox(): void {
    this.showCommentBox = !this.showCommentBox;
    if (!this.showCommentBox) {
      this.rejectionComment = '';
    }
  }

  rejectVerification(): void {
    if (!this.rejectionComment.trim()) {
      this._snackBar.open('Please provide a reason for rejection', 'Close', {
        duration: 2000,
      });
      return;
    }

    this._adminService
      .rejectCompanyVerification(this.companyId, this.rejectionComment)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this._snackBar.open(
            'Verification rejected and company notified',
            'Close',
            { duration: 2000 }
          );
          this.showCommentBox = false;
          this.rejectionComment = '';
          this.loadCompanyDetails();
        },
        error: (error) => {
          this._snackBar.open(
            error.error?.message || 'Failed to reject verification',
            'Close',
            { duration: 3000 }
          );
        },
      });
  }

  downloadDocument(documentKey: string, fileName: string): void {
    this._adminService
      .getDocumentSignedUrl(documentKey)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data?.url) {
            // Open in new tab or trigger download
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

  blockCompany(): void {
    if (!this.company) return;

    const confirmed = confirm(
      `Are you sure you want to block ${this.company.name}?`
    );
    if (!confirmed) return;

    this._adminService
      .blockOrUnblockCompany(this.companyId, true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this._snackBar.open('Company blocked successfully', 'Close', {
            duration: 2000,
          });
          this.loadCompanyDetails();
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

  unblockCompany(): void {
    if (!this.company) return;

    const confirmed = confirm(
      `Are you sure you want to unblock ${this.company.name}?`
    );
    if (!confirmed) return;

    this._adminService
      .blockOrUnblockCompany(this.companyId, false)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this._snackBar.open('Company unblocked successfully', 'Close', {
            duration: 2000,
          });
          this.loadCompanyDetails();
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

  goBack(): void {
    this._router.navigate(['/admin/dashboard/companies']);
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
}
