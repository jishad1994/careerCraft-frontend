import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { CompanyProfile } from '../../../../models/company/company-profile.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CompanyProfileService } from '../../../../services/company/profile/company-profile.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-company-basic-profile',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './company-basic-profile.component.html',
  styleUrl: './company-basic-profile.component.css',
})
export class CompanyBasicProfileComponent implements OnInit, OnDestroy {
  @Input() profile: CompanyProfile | null = null;
  @Output() updatedProfile = new EventEmitter<CompanyProfile>();

  loading = false;
  uploadingImage = false;
  uploadingBanner = false;
  showImageMenu = false;
  showBannerMenu = false;
  editBasicInfo = false;

  basicInfoForm!: FormGroup;

  destroy$ = new Subject<void>();

  constructor(
    private _fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private _companyProfileService: CompanyProfileService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.patchBasicInfo();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.basicInfoForm = this._fb.group({
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

  saveBasicInfo(): void {
    if (this.basicInfoForm.invalid) {
      this.basicInfoForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this._companyProfileService
      .updateBasicProfile(this.basicInfoForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.updatedProfile.emit(response.data as CompanyProfile);
          this.editBasicInfo = false;
          this.loading = false;
          this._snackBar.open('Profile updated successfully', 'close', {
            duration: 2000,
          });
        },
        error: (err) => {
          this.loading = false;
          this._snackBar.open(err.error?.message || 'Update failed', 'close', {
            duration: 3000,
          });
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
    });
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
      'profilePictureInput'
    ) as HTMLInputElement;
    fileInput?.click();
    this.showImageMenu = false;
  }

  onProfilePictureSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        this._snackBar.open('Please select an image file', 'close', {
          duration: 3000,
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this._snackBar.open('File size must be less than 5MB', 'close', {
          duration: 3000,
        });
        return;
      }

      this.uploadProfilePicture(file);
    }
  }

  uploadProfilePicture(file: File): void {
    this.uploadingImage = true;
    this._companyProfileService
      .updateProfilePicture(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (this.profile) {
            this.updatedProfile.emit(response.data as CompanyProfile);
          }
          this.uploadingImage = false;
          this._snackBar.open('Profile picture updated successfully', 'close', {
            duration: 2000,
          });
        },
        error: (err) => {
          this.uploadingImage = false;
          this._snackBar.open(err.error?.message || 'Upload failed', 'close', {
            duration: 3000,
          });
        },
      });
  }

  deleteProfilePicture(): void {
    if (!confirm('Delete your profile picture?')) return;

    this.showImageMenu = false;
    this.uploadingImage = true;
    this._companyProfileService
      .deleteProfilePicture()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (this.profile) {
            this.profile.profilePicture = undefined;
            this.updatedProfile.emit(response.data as CompanyProfile);
          }
          this.uploadingImage = false;
          this._snackBar.open('Profile picture deleted successfully', 'close', {
            duration: 2000,
          });
        },
        error: () => {
          this.uploadingImage = false;
          this._snackBar.open('Delete failed', 'close', { duration: 3000 });
        },
      });
  }

  // Banner Image Methods
  toggleBannerMenu(): void {
    this.showBannerMenu = !this.showBannerMenu;
  }

  onSelectBannerImage(): void {
    const fileInput = document.getElementById(
      'bannerImageInput'
    ) as HTMLInputElement;
    fileInput?.click();
    this.showBannerMenu = false;
  }

  onBannerImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        this._snackBar.open('Please select an image file', 'close', {
          duration: 3000,
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        this._snackBar.open('File size must be less than 10MB', 'close', {
          duration: 3000,
        });
        return;
      }

      this.uploadBannerImage(file);
    }
  }

  uploadBannerImage(file: File): void {
    this.uploadingBanner = true;
    this._companyProfileService
      .updateBannerImage(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (this.profile) {
            this.updatedProfile.emit(response.data as CompanyProfile);
          }
          this.uploadingBanner = false;
          this._snackBar.open('Banner image updated successfully', 'close', {
            duration: 2000,
          });
        },
        error: (err) => {
          this.uploadingBanner = false;
          this._snackBar.open(err.error?.message || 'Upload failed', 'close', {
            duration: 3000,
          });
        },
      });
  }

  deleteBannerImage(): void {
    if (!confirm('Delete your banner image?')) return;

    this.showBannerMenu = false;
    this.uploadingBanner = true;
    this._companyProfileService
      .deleteBannerImage()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (this.profile) {
            this.updatedProfile.emit(response.data as CompanyProfile);
            this.profile.bannerImage = undefined;
          }
          this.uploadingBanner = false;
          this._snackBar.open('Banner image deleted successfully', 'close', {
            duration: 2000,
          });
        },
        error: () => {
          this.uploadingBanner = false;
          this._snackBar.open('Delete failed', 'close', { duration: 3000 });
        },
      });
  }

  getInitials(): string {
    if (!this.profile) return '';
    return this.profile.name.substring(0, 2).toUpperCase();
  }
}
