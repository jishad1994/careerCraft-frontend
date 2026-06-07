import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import {
  COMPANY_VERIFICATION_STATUS,
  CompanyProfile,
  RejectionReasonDTO,
} from '../../../../models/company/company-profile.model';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CompanyProfileService } from '../../../../services/company/profile/company-profile.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-company-basic-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './company-basic-profile.component.html',
  styleUrl: './company-basic-profile.component.css',
})
export class CompanyBasicProfileComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly companyProfileService = inject(CompanyProfileService);

  @Input() profile: CompanyProfile | null = null;
  @Output() updatedProfile = new EventEmitter<CompanyProfile>();

  loading = false;
  uploadingImage = false;
  uploadingBanner = false;
  showImageMenu = false;
  showBannerMenu = false;
  editBasicInfo = false;
  reapplyingVerification = false;

  basicInfoForm!: FormGroup;

  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.initForm();
    this.patchBasicInfo();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isCompanyVerified(): boolean {
    return (
      this.profile?.verificationStatus === COMPANY_VERIFICATION_STATUS.APPROVED
    );
  }

  get isCompanyRejected(): boolean {
    return (
      this.profile?.verificationStatus === COMPANY_VERIFICATION_STATUS.REJECTED
    );
  }

  get isCompanyPending(): boolean {
    return (
      this.profile?.verificationStatus === COMPANY_VERIFICATION_STATUS.PENDING
    );
  }

  get canReapplyVerification(): boolean {
    return (
      this.isCompanyRejected &&
      this.profile !== null &&
      this.profile.profileCompletion >= 80 &&
      this.profile.documents &&
      this.profile.documents.length > 0
    );
  }

  initForm(): void {
    this.basicInfoForm = this.fb.group({
      name: ['', Validators.required],
      phone: [''],
      website: [''],
      location: [''],
      industry: [''],
      GSTIN: [''],
      description: [''],
      numberOfEmployees: [''],
    });
  }

 get getVerificationStatusBadgeClass(): string {
    switch (this.profile?.verificationStatus) {
      case COMPANY_VERIFICATION_STATUS.APPROVED:  
        return 'bg-green-100 text-green-800';
      case COMPANY_VERIFICATION_STATUS.REJECTED:
        return 'bg-red-100 text-red-800';
      case COMPANY_VERIFICATION_STATUS.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  saveBasicInfo(): void {
    if (this.basicInfoForm.invalid) {
      this.basicInfoForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.companyProfileService
      .updateBasicProfile(this.basicInfoForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.updatedProfile.emit(response.data as CompanyProfile);
          this.editBasicInfo = false;
          this.loading = false;
          this.snackBar.open('Profile updated successfully', 'Close', {
            duration: 2000,
          });
        },
        error: (err) => {
          this.loading = false;
          this.snackBar.open(err.error?.message || 'Update failed', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  get latestRejectionReason(): RejectionReasonDTO | null {
    if (
      !this.profile?.rejectionReasons ||
      this.profile.rejectionReasons.length === 0
    ) {
      return null;
    }

    return this.profile.rejectionReasons.reduce((latest, current) => {
      const latestDate = new Date(latest.rejectedAt).getTime();
      const currentDate = new Date(current.rejectedAt).getTime();

      return currentDate > latestDate ? current : latest;
    });
  }

  getRejectionMessage(reason: RejectionReasonDTO): string {
    // if (reason.description) return reason.description;

    switch (reason.code) {
      case 'INVALID_DOCUMENT':
        return 'Invalid or unreadable document submitted';
      case 'MISMATCHED_GST':
        return 'GST details do not match company information';
      case 'INCOMPLETE_PROFILE':
        return 'Profile information is incomplete';
      case 'DUPLICATE_COMPANY':
        return 'Company already exists in the system';
      case 'OTHER':
        return 'Verification rejected due to policy reasons';
      default:
        return 'Verification rejected';
    }
  }

  reapplyForVerification(): void {
    if (!this.canReapplyVerification) {
      this.snackBar.open(
        'Please complete your profile (90%) and upload required documents before reapplying',
        'Close',
        { duration: 4000 },
      );
      return;
    }

    const confirmed = confirm(
      'Are you sure you want to reapply for verification? Your profile will be reviewed by our admin team.',
    );

    if (!confirmed) return;

    this.reapplyingVerification = true;
    this.companyProfileService
      .reapplyForVerification()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.updatedProfile.emit(response.data);
            this.snackBar.open(
              'Verification request submitted successfully! Your profile is now pending review.',
              'Close',
              { duration: 4000 },
            );
          }
          this.reapplyingVerification = false;
        },
        error: (err) => {
          this.reapplyingVerification = false;
          this.snackBar.open(
            err.message || 'Failed to submit verification request',
            'Close',
            { duration: 3000 },
          );
        },
      });
  }

  patchBasicInfo(): void {
    if (!this.profile) return;
    this.basicInfoForm.patchValue({
      name: this.profile.name,
      phone: this.profile.phone,
      website: this.profile.website,
      location: this.profile.location,
      industry: this.profile.industry,
      GSTIN: this.profile.GSTIN,
      description: this.profile.description,
      numberOfEmployees: this.profile.numberOfEmployees,
    });
  }

  getCompletionColor(): string {
    if (this.profile && this.profile?.profileCompletion >= 80)
      return 'bg-green-500';
    if (this.profile && this.profile?.profileCompletion >= 50)
      return 'bg-yellow-500';
    return 'bg-red-500';
  }

  getCompletionTextColor(): string {
    if (this.profile && this.profile?.profileCompletion >= 80)
      return 'text-green-700';
    if (this.profile && this.profile?.profileCompletion >= 50)
      return 'text-yellow-700';
    return 'text-red-700';
  }

  toggleEditBasicInfo(): void {
    this.editBasicInfo = !this.editBasicInfo;
    if (!this.editBasicInfo) {
      this.patchBasicInfo();
    }
  }

  toggleImageMenu(): void {
    this.showImageMenu = !this.showImageMenu;
  }

  onSelectProfileImage(): void {
    const fileInput = document.getElementById(
      'profilePictureInput',
    ) as HTMLInputElement;
    fileInput?.click();
    this.showImageMenu = false;
  }

  onProfilePictureSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        this.snackBar.open('Please select an image file', 'Close', {
          duration: 3000,
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('File size must be less than 5MB', 'Close', {
          duration: 3000,
        });
        return;
      }

      this.uploadProfilePicture(file);
    }
  }

  uploadProfilePicture(file: File): void {
    this.uploadingImage = true;
    this.companyProfileService
      .updateProfilePicture(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (this.profile) {
            this.updatedProfile.emit(response.data as CompanyProfile);
          }
          this.uploadingImage = false;
          this.snackBar.open('Profile picture updated successfully', 'Close', {
            duration: 2000,
          });
        },
        error: (err) => {
          this.uploadingImage = false;
          this.snackBar.open(err.error?.message || 'Upload failed', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  deleteProfilePicture(): void {
    if (!confirm('Delete your profile picture?')) return;

    this.showImageMenu = false;
    this.uploadingImage = true;
    this.companyProfileService
      .deleteProfilePicture()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (this.profile) {
            this.profile.profilePicture = undefined;
            this.updatedProfile.emit(response.data as CompanyProfile);
          }
          this.uploadingImage = false;
          this.snackBar.open('Profile picture deleted successfully', 'Close', {
            duration: 2000,
          });
        },
        error: () => {
          this.uploadingImage = false;
          this.snackBar.open('Delete failed', 'Close', { duration: 3000 });
        },
      });
  }

  toggleBannerMenu(): void {
    this.showBannerMenu = !this.showBannerMenu;
  }

  onSelectBannerImage(): void {
    const fileInput = document.getElementById(
      'bannerImageInput',
    ) as HTMLInputElement;
    fileInput?.click();
    this.showBannerMenu = false;
  }

  onBannerImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        this.snackBar.open('Please select an image file', 'Close', {
          duration: 3000,
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        this.snackBar.open('File size must be less than 10MB', 'Close', {
          duration: 3000,
        });
        return;
      }

      this.uploadBannerImage(file);
    }
  }

  uploadBannerImage(file: File): void {
    this.uploadingBanner = true;
    this.companyProfileService
      .updateBannerImage(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (this.profile) {
            this.updatedProfile.emit(response.data as CompanyProfile);
          }
          this.uploadingBanner = false;
          this.snackBar.open('Banner image updated successfully', 'Close', {
            duration: 2000,
          });
        },
        error: (err) => {
          this.uploadingBanner = false;
          this.snackBar.open(err.error?.message || 'Upload failed', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  deleteBannerImage(): void {
    if (!confirm('Delete your banner image?')) return;

    this.showBannerMenu = false;
    this.uploadingBanner = true;
    this.companyProfileService
      .deleteBannerImage()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (this.profile) {
            this.updatedProfile.emit(response.data as CompanyProfile);
            this.profile.bannerImage = undefined;
          }
          this.uploadingBanner = false;
          this.snackBar.open('Banner image deleted successfully', 'Close', {
            duration: 2000,
          });
        },
        error: () => {
          this.uploadingBanner = false;
          this.snackBar.open('Delete failed', 'Close', { duration: 3000 });
        },
      });
  }

  getInitials(): string {
    if (!this.profile) return '';
    return this.profile.name.substring(0, 2).toUpperCase();
  }
}
