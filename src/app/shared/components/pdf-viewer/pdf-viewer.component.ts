import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface PdfViewerData {
  blob?: Blob;
  fileUrl?: string;
  fileName?: string;
  candidateName?: string;
}

@Component({
  selector: 'app-pdf-viewer',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './pdf-viewer.component.html',
  styleUrl: './pdf-viewer.component.css',
})
export class PdfViewerComponent implements OnInit, OnDestroy {
   resumeUrl: SafeResourceUrl | null = null;
  fileName = 'resume.pdf';
  downloading = false;

  private objectUrl: string | null = null;

  constructor(
    private dialogRef: MatDialogRef<PdfViewerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PdfViewerData,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    if (this.data.blob) {
      this.objectUrl = URL.createObjectURL(this.data.blob);
      this.resumeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.objectUrl);
    } else if (this.data.fileUrl) {
      this.resumeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.data.fileUrl);
    }

    if (this.data.fileName) {
      this.fileName = this.data.fileName;
    }
  }

  ngOnDestroy(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
    }
  }

  downloadResume(): void {
    if (!this.data.blob) {
      window.open(this.data.fileUrl, '_blank');
      return;
    }

    const url = URL.createObjectURL(this.data.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  close(): void {
    this.dialogRef.close();
  }
}
