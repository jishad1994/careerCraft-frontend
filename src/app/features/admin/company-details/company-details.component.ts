import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  COMPANY_VERIFICATION_STATUS,
  CompanyProfile,
  CompanyRejectionCodes,
  RejectionReasonDTO,
} from '../../../models/company/company-profile.model';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../../services/admin/user-management/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-company-details',
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
    MatDialogModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
  ],
  templateUrl: './company-details.component.html',
  styleUrl: './company-details.component.css',
})
export class CompanyDetailsComponent implements OnInit, OnDestroy {
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _adminService = inject(AdminService);
  private readonly _snackBar = inject(MatSnackBar);
  private readonly _dialog = inject(MatDialog);

  company: CompanyProfile | null = null;
  loading = false;
  companyId = '';
  showCommentBox = false;
  private readonly destroy$ = new Subject<void>();

  rejectionCodes = Object.values(CompanyRejectionCodes);
  selectedRejectionCode?: CompanyRejectionCodes;
  rejectionComment = '';

  ngOnInit(): void {
    this.companyId = this._route.snapshot.paramMap.get('id') || '';
    if (this.companyId) {
      this.loadCompanyDetails();
    } else {
      this._router.navigate(['/admin/dashboard/companies']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isCompanyVerified(): boolean {
    return (
      this.company?.verificationStatus === COMPANY_VERIFICATION_STATUS.APPROVED
    );
  }

  get isCompanyRejected(): boolean {
    return (
      this.company?.verificationStatus === COMPANY_VERIFICATION_STATUS.REJECTED
    );
  }

  get isCompanyPending(): boolean {
    return (
      this.company?.verificationStatus === COMPANY_VERIFICATION_STATUS.PENDING
    );
  }

  get sortedRejectionHistory(): RejectionReasonDTO[] {
    if (!this.company?.rejectionReasons) return [];
    return [...this.company.rejectionReasons].sort(
      (a, b) =>
        new Date(b.rejectedAt).getTime() - new Date(a.rejectedAt).getTime()
    );
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
        next: () => {
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
      this.selectedRejectionCode = undefined;
      this.rejectionComment = '';
    }
  }

  rejectVerification(): void {
    if (!this.selectedRejectionCode) {
      this._snackBar.open('Please select a rejection reason', 'Close', {
        duration: 2000,
      });
      return;
    }

    const code = this.selectedRejectionCode;
    const description = this.rejectionComment || undefined;

    this._adminService
      .rejectCompanyVerification(this.companyId, code, description)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this._snackBar.open(
            'Verification rejected and company notified',
            'Close',
            { duration: 2000 }
          );
          this.toggleCommentBox();
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
            const link = document.createElement('a');
            link.href = response.data.url;
            link.target = '_blank';
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
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
        next: () => {
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
        next: () => {
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

  formatDateTime(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  getRejectionCodeLabel(code: string): string {
    return code.replaceAll('_', ' ');
  }
}