import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IDocuments, UserProfile } from '../../../../models/user/user-profile.model';
import { Subject, takeUntil } from 'rxjs';
import { UserProfileService } from '../../../../services/user/profile/user-profile.service';
import { FormBuilder, FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-resume-section',
  imports: [CommonModule,FormsModule],
  templateUrl: './resume-section.component.html',
  styleUrl: './resume-section.component.css'
})
export class ResumeSectionComponent {
@Input() profile: UserProfile | null = null;
  @Output() updatedProfile = new EventEmitter<UserProfile>();

  uploadingDocument = false;
  loading = false;

  destroy$ = new Subject<void>();

  constructor(
    private _userProfileService: UserProfileService,
    private _snackBar: MatSnackBar
  ) {}

  onSelectDocument(): void {
    const fileInput = document.getElementById(
      'documentInput'
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
          { duration: 3000 }
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
    this._userProfileService
      .uploadResume(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (this.profile) {
            this.updatedProfile.emit(response.data as UserProfile);
          }
          this.uploadingDocument = false;
          this._snackBar.open('Resume uploaded successfully', 'close', {
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

  deleteDocument(documentkey: string): void {
    if (!confirm('Delete this resume?')) return;

    this.loading = true;
    this._userProfileService
      .deleteResume(documentkey)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (this.profile) {
            this.updatedProfile.emit(response.data as UserProfile);
          }
          this.loading = false;
          this._snackBar.open('Resume deleted successfully', 'close', {
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

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
