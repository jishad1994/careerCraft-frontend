import { Component, EventEmitter, Input, Output, OnDestroy, inject } from '@angular/core';
import {
  IDocuments,
  UserProfile,
} from '../../../../models/user/user-profile.model';
import { Subject, takeUntil } from 'rxjs';
import { UserProfileService } from '../../../../services/user/profile/user-profile.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PdfViewerComponent } from '../../../../shared/components/pdf-viewer/pdf-viewer.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-resume-section',
  imports: [CommonModule, FormsModule],
  templateUrl: './resume-section.component.html',
  styleUrl: './resume-section.component.css',
})
export class ResumeSectionComponent implements OnDestroy {
  private _userProfileService = inject(UserProfileService);
  private _snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
private _router = inject(Router);
  @Input() profile: UserProfile | null = null;
  @Output() updatedProfile = new EventEmitter<UserProfile>();

  uploadingDocument = false;
  loading = false;
  destroy$ = new Subject<void>();

  onSelectResume(): void {
    const fileInput = document.getElementById('documentInput') as HTMLInputElement;
    fileInput?.click();
  }

  onResumeSelected(event: Event): void {
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

      this.uploadResume(file);
    }
  }
goToResumeBuilder(): void {
    this._router.navigate(['/user/resume-builder']);
}
  uploadResume(file: File): void {
    this.uploadingDocument = true;
    
    this._userProfileService
      .uploadResume(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (this.profile) {
            this.updatedProfile.emit(response.data as UserProfile);
          }
          this.uploadingDocument = false;
          this._snackBar.open(
            response.message || 'Resume uploaded successfully',
            'Close',
            { duration: 2000 }
          );
        },
        error: (err) => {
          this.uploadingDocument = false;
          this._snackBar.open(
            err.message || 'Upload failed',
            'Close',
            { duration: 3000 }
          );
        },
      });
  }

  viewResume(doc: IDocuments): void {
    if (!doc) return;
    
    this._userProfileService
      .viewResume(doc.key)
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
            error.message || 'Failed to load document',
            'Close',
            { duration: 3000 }
          );
        },
      });
  }

  deleteResume(resumeKey: string): void {
    if (!confirm('Are you sure you want to delete this resume?')) return;

    this.loading = true;
    
    this._userProfileService
      .deleteResume(resumeKey)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (this.profile) {
            this.updatedProfile.emit(response.data as UserProfile);
          }
          this.loading = false;
          this._snackBar.open(
            'Resume deleted successfully',
            'Close',
            { duration: 2000 }
          );
        },
        error: (error) => {
          this.loading = false;
          this._snackBar.open(
            error.message || 'Delete failed',
            'Close',
            { duration: 3000 }
          );
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