import { Component, EventEmitter, Input, OnDestroy,  Output, inject } from '@angular/core';
import { CompanyProfile } from '../../../../models/company/company-profile.model';
import { Subject, takeUntil } from 'rxjs';
import { CompanyProfileService } from '../../../../services/company/profile/company-profile.service';
import { FormBuilder, FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { IDocuments } from '../../../../models/user/user-profile.model';
import { MatDialog } from '@angular/material/dialog';
import { PdfViewerComponent } from '../../../../shared/components/pdf-viewer/pdf-viewer.component';
@Component({
  selector: 'app-company-document-section',
  imports: [CommonModule, FormsModule],
  templateUrl: './company-document-section.component.html',
  styleUrl: './company-document-section.component.css',
})
export class CompanyDocumentSectionComponent implements  OnDestroy {
  private _companyProfileService = inject(CompanyProfileService);
  private fb = inject(FormBuilder);
  private _snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  @Input() profile: CompanyProfile | null = null;
  @Output() updatedProfile = new EventEmitter<CompanyProfile>();

  uploadingDocument = false;
  loading = false;

  destroy$ = new Subject<void>();

  onSelectDocument(): void {
    const fileInput = document.getElementById(
      'documentInput',
    ) as HTMLInputElement;
    fileInput?.click();
  }

  onDocumentSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const file = input.files[0];

      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
      ];
      if (!allowedTypes.includes(file.type)) {
        this._snackBar.open(
          'Only PDF, JPEG, and PNG files are allowed',
          'close',
          { duration: 3000 },
        );
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        this._snackBar.open('File size must be less than 10MB', 'close', {
          duration: 3000,
        });
        return;
      }

      this.uploadDocument(file);
    }
  }

  uploadDocument(file: File): void {
    this.uploadingDocument = true;
    this._companyProfileService
      .uploadDocument(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (this.profile) {
            this.profile.documents = response.data?.documents || [];
          }
          this.uploadingDocument = false;
          this._snackBar.open('Document uploaded successfully', 'close', {
            duration: 2000,
          });
        },
        error: (err) => {
          this.uploadingDocument = false;
          this._snackBar.open(err.error?.message || 'Upload failed', 'close', {
            duration: 3000,
          });
        },
      });
  }

  viewDocument(doc: IDocuments, _mode = 'view'): void {
    if (!doc) return;
    // Stream resume from backend
    this._companyProfileService
      .viewDocument(doc.key)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          this.dialog.open(PdfViewerComponent, {
            width: '90vw',
            maxWidth: '1200px',
            height: '90vh',
            data: {
              blob,
              fileName: doc.originalName,
            },
          });
        },
        error: (error) => {
          this._snackBar.open(
            error.message || 'Failed to load Document',
            'Close',
            {
              duration: 3000,
            },
          );
        },
      });
  }

  deleteDocument(documentKey: string): void {
    if (!confirm('Delete this document?')) return;

    this.loading = true;
    this._companyProfileService
      .deleteDocument(documentKey)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (this.profile) {
            this.profile.documents = response.data?.documents || [];
          }
          this.loading = false;
          this._snackBar.open('Document deleted successfully', 'close', {
            duration: 2000,
          });
        },
        error: () => {
          this.loading = false;
          this._snackBar.open('Delete failed', 'close', { duration: 3000 });
        },
      });
  }

  getDocumentName(doc: IDocuments): string {
    return doc.originalName;
  }

  getDocumentIcon(doc: IDocuments): 'pdf' | 'image' {
    if (doc.mimeType === 'application/pdf') {
      return 'pdf';
    }
    if (doc.mimeType.startsWith('image/')) {
      return 'image';
    }
    return 'image';
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
