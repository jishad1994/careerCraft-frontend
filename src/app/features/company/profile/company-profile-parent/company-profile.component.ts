import { Component, OnDestroy, OnInit } from '@angular/core';
import { CompanyProfile } from '../../../../models/company/company-profile.model';
import { Subject, takeUntil } from 'rxjs';
import { CompanyProfileService } from '../../../../services/company/profile/company-profile.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiResponse } from '../../../../models/api-response.model';
import { CompanyBasicProfileComponent } from '../company-basic-profile/company-basic-profile.component';
import { CompanyDocumentSectionComponent } from '../company-document-section/company-document-section.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-company-profile',
  imports: [
    CompanyBasicProfileComponent,
    CompanyDocumentSectionComponent,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './company-profile.component.html',
  styleUrl: './company-profile.component.css',
})
export class CompanyProfileComponent implements OnInit, OnDestroy {
  profile: CompanyProfile | null = null;

  loading = false;

  destroy$ = new Subject<void>();

  constructor(
    private _companyProfileService: CompanyProfileService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProfile(): void {
    this.loading = true;
    this._companyProfileService
      .getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<CompanyProfile>) => {
          this.profile = response.data;
          this.loading = false;
        },
        error: (err) => {
          this._snackBar.open(
            err.message || 'Failed to load profile',
            'close',
            { duration: 3000 }
          );
          this.loading = false;
        },
      });
  }

  onChildUpdated(updatedProfile: CompanyProfile): void {
    this.profile = updatedProfile;
  }
}
