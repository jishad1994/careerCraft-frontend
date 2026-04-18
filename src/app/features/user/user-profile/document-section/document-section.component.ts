import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnDestroy, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  IDocuments,
  UserProfile,
} from '../../../../models/user/user-profile.model';
import { Subject, takeUntil } from 'rxjs';
import { UserProfileService } from '../../../../services/user/profile/user-profile.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-document-section',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './document-section.component.html',
  styleUrl: './document-section.component.css',
})
export class DocumentSectionComponent implements OnDestroy {
  private _userProfileService = inject(UserProfileService);
  private _snackBar = inject(MatSnackBar);

  @Input() profile: UserProfile | null = null;
  @Output() updatedProfile = new EventEmitter<UserProfile>();

  uploadingDocument = false;
  loading = false;

  private destroy$ = new Subject<void>();

  onSelectDocument(): void {
    const fileInput = document.getElementById('documentInput') as HTMLInputElement;
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
          'Close',
          { duration: 3000 }
        );
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        this._snackBar.open(
          'File size must be less than 10MB',
          'Close',
          { duration: 3000 }
        );
        return;
      }

      this.uploadDocument(file);
    }
  }

  uploadDocument(file: File): void {
    this.uploadingDocument = true;
    
    this._userProfileService
      .uploadCertificate(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (this.profile) {
            this.updatedProfile.emit(response.data as UserProfile);
          }
          this.uploadingDocument = false;
          this._snackBar.open('Document uploaded successfully', 'Close', {
            duration: 2000,
          });
        },
        error: (err) => {
          this.uploadingDocument = false;
          this._snackBar.open(
            err.error?.message || 'Upload failed',
            'Close',
            { duration: 3000 }
          );
        },
      });
  }

  viewDocument(doc: IDocuments): void {
    this._userProfileService
      .viewDocument(doc.key)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
          
          // Clean up the URL after opening
          setTimeout(() => window.URL.revokeObjectURL(url), 100);
        },
        error: (err) => {
          this._snackBar.open(
            err.message || 'Failed to view document',
            'Close',
            { duration: 3000 }
          );
        },
      });
  }

  deleteDocument(documentKey: string): void {
    if (!confirm('Are you sure you want to delete this document?')) return;

    this.loading = true;
    
    this._userProfileService
      .deleteCertificate(documentKey)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (this.profile) {
            this.updatedProfile.emit(response.data as UserProfile);
          }
          this.loading = false;
          this._snackBar.open('Document deleted successfully', 'Close', {
            duration: 2000,
          });
        },
        error: () => {
          this.loading = false;
          this._snackBar.open('Delete failed', 'Close', { duration: 3000 });
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