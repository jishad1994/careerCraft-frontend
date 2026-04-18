import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { UserProfile } from '../../../../models/user/user-profile.model';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserProfileService } from '../../../../services/user/profile/user-profile.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  Subject,
  takeUntil,
  debounceTime,
  distinctUntilChanged,
  switchMap,
} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {
  ImageCroppedEvent,
  ImageCropperComponent,
  LoadedImage,
} from 'ngx-image-cropper';

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

@Component({
  selector: 'app-basic-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    ImageCropperComponent,
  ],
  templateUrl: './basic-profile.component.html',
  styleUrl: './basic-profile.component.css',
})
export class BasicProfileComponent implements OnInit, OnChanges, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly userProfileService = inject(UserProfileService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly http = inject(HttpClient);

  @Input() profile: UserProfile | null = null;
  @Output() updatedBasicInfo = new EventEmitter<UserProfile>();

  loading = false;
  editBasicInfo = false;
  uploadingProfileImage = false;
  uploadingBannerImage = false;
  showImageMenu = false;
  showBannerMenu = false;

  // Image cropper states
  showProfileCropper = false;
  showBannerCropper = false;
  profileImageChangedEvent: Event | null = null;
  bannerImageChangedEvent: Event | null = null;
  croppedProfileImage: string | null = null;
  croppedBannerImage: string | null = null;

  // Image preview modal
  showImagePreview = false;
  previewImageUrl: string | null = null;

  basicInfoForm!: FormGroup;

  // Location autocomplete
  locationSuggestions: LocationSuggestion[] = [];
  showLocationSuggestions = false;
  loadingLocations = false;

  private readonly destroy$ = new Subject<void>();
  private readonly locationSearch$ = new Subject<string>();

  ngOnInit(): void {
    this.initializeForm();
    this.setupLocationSearch();
    this.patchBasicInfo();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['profile'] && this.basicInfoForm && this.profile) {
      this.patchBasicInfo();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeForm(): void {
    this.basicInfoForm = this.fb.group({
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      phone: ['', [Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      about: ['', [Validators.maxLength(1000)]],
      location: ['', [Validators.maxLength(100)]],
      address: this.fb.group({
        city: ['', [Validators.required, Validators.minLength(2)]],
        state: ['', [Validators.required, Validators.minLength(2)]],
        country: ['', [Validators.required, Validators.minLength(2)]],
        postalCode: [
          '',
          [Validators.required, Validators.pattern(/^[A-Z0-9\s-]{3,10}$/i)],
        ],
      }),
    });
  }

  setupLocationSearch(): void {
    this.locationSearch$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => this.searchLocations(query)),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (results) => {
          this.locationSuggestions = results;
          this.showLocationSuggestions = results.length > 0;
          this.loadingLocations = false;
        },
        error: () => {
          this.loadingLocations = false;
          this.showLocationSuggestions = false;
        },
      });
  }

  searchLocations(query: string) {
    if (!query || query.length < 3) {
      return new Promise<LocationSuggestion[]>((resolve) => resolve([]));
    }

    this.loadingLocations = true;
    return this.http.get<LocationSuggestion[]>(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
    );
  }

  onLocationInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.locationSearch$.next(input.value);
  }

  selectLocation(location: LocationSuggestion): void {
    this.basicInfoForm.patchValue({ location: location.display_name });
    this.showLocationSuggestions = false;
    this.locationSuggestions = [];
  }

  patchBasicInfo(): void {
    if (!this.profile) return;

    this.basicInfoForm.patchValue({
      firstName: this.profile.firstName || '',
      lastName: this.profile.lastName || '',
      phone: this.profile.phone || '',
      about: this.profile.about || '',
      location: this.profile.location || '',
      address: {
        city: this.profile.address?.city || '',
        state: this.profile.address?.state || '',
        country: this.profile.address?.country || '',
        postalCode: this.profile.address?.postalCode || '',
      },
    });
  }

  toggleEditBasicInfo(): void {
    this.editBasicInfo = !this.editBasicInfo;
    if (this.editBasicInfo) {
      this.patchBasicInfo();
    } else {
      this.patchBasicInfo();
    }
  }

  onSave(): void {
    if (this.basicInfoForm.invalid) {
      this.basicInfoForm.markAllAsTouched();
      this.snackBar.open('Please fix all validation errors', 'Close', {
        duration: 3000,
      });
      return;
    }

    this.loading = true;
    this.userProfileService
      .updateProfile(this.basicInfoForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.updatedBasicInfo.emit(response.data);
            this.editBasicInfo = false;
            this.snackBar.open('Profile updated successfully', 'Close', {
              duration: 2000,
            });
          }
          this.loading = false;
        },
        error: (error: { error?: { message?: string } }) => {
          this.loading = false;
          this.snackBar.open(
            error.error?.message || 'Failed to update profile',
            'Close',
            { duration: 3000 },
          );
        },
      });
  }

  // Profile Picture Functions
  toggleImageMenu(): void {
    this.showImageMenu = !this.showImageMenu;
  }

  onSelectProfileImage(): void {
    const fileInput = document.getElementById(
      'profileImageInput',
    ) as HTMLInputElement;
    fileInput?.click();
    this.showImageMenu = false;
  }

  onProfileImageSelected(event: Event): void {
    this.profileImageChangedEvent = event;
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
        this.snackBar.open('Image size must be less than 5MB', 'Close', {
          duration: 3000,
        });
        return;
      }

      this.showProfileCropper = true;
    }
  }

  profileImageCropped(event: ImageCroppedEvent): void {
    this.croppedProfileImage = event.objectUrl || event.base64 || null;
  }

  profileImageLoaded(image: LoadedImage): void {
    // Image loaded successfully
  }

  profileCropperReady(): void {
    // Cropper ready
  }

  profileLoadImageFailed(): void {
    this.snackBar.open('Failed to load image', 'Close', { duration: 3000 });
    this.cancelProfileCrop();
  }

  cancelProfileCrop(): void {
    this.showProfileCropper = false;
    this.profileImageChangedEvent = null;
    this.croppedProfileImage = null;
  }

  uploadProfileImage(): void {
    if (!this.croppedProfileImage) return;

    this.uploadingProfileImage = true;
    this.showProfileCropper = false;

    fetch(this.croppedProfileImage)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });

        this.userProfileService
          .updateProfilePicture(file)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              if (response.success && response.data) {
                this.updatedBasicInfo.emit(response.data);
                this.snackBar.open('Profile picture updated', 'Close', {
                  duration: 2000,
                });
              }
              this.uploadingProfileImage = false;
              this.profileImageChangedEvent = null;
              this.croppedProfileImage = null;
            },
            error: (error: { error?: { message?: string } }) => {
              this.uploadingProfileImage = false;
              this.snackBar.open(
                error.error?.message || 'Upload failed',
                'Close',
                { duration: 3000 },
              );
            },
          });
      });
  }

  deleteProfileImage(): void {
    if (!confirm('Delete your profile picture?')) return;

    this.showImageMenu = false;
    this.uploadingProfileImage = true;

    this.userProfileService
      .deleteProfilePicture()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.updatedBasicInfo.emit(response.data);
            this.snackBar.open('Profile picture deleted', 'Close', {
              duration: 2000,
            });
          }
          this.uploadingProfileImage = false;
        },
        error: () => {
          this.uploadingProfileImage = false;
          this.snackBar.open('Delete failed', 'Close', { duration: 3000 });
        },
      });
  }

  viewProfileImage(): void {
    if (this.profile?.profilePicture?.location) {
      this.previewImageUrl = this.profile.profilePicture.location;
      this.showImagePreview = true;
    }
  }

  // Banner Image Functions
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
    this.bannerImageChangedEvent = event;
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
        this.snackBar.open('Image size must be less than 10MB', 'Close', {
          duration: 3000,
        });
        return;
      }

      this.showBannerCropper = true;
    }
  }

  bannerImageCropped(event: ImageCroppedEvent): void {
    this.croppedBannerImage = event.objectUrl || event.base64 || null;
  }

  bannerImageLoaded(image: LoadedImage): void {
    // Image loaded
  }

  bannerCropperReady(): void {
    // Cropper ready
  }

  bannerLoadImageFailed(): void {
    this.snackBar.open('Failed to load image', 'Close', { duration: 3000 });
    this.cancelBannerCrop();
  }

  cancelBannerCrop(): void {
    this.showBannerCropper = false;
    this.bannerImageChangedEvent = null;
    this.croppedBannerImage = null;
  }

  uploadBannerImage(): void {
    if (!this.croppedBannerImage) return;

    this.uploadingBannerImage = true;
    this.showBannerCropper = false;

    fetch(this.croppedBannerImage)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], 'banner-image.jpg', { type: 'image/jpeg' });

        this.userProfileService
          .updateBannerImage(file)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              if (response.success && response.data) {
                this.updatedBasicInfo.emit(response.data);
                this.snackBar.open('Banner image updated', 'Close', {
                  duration: 2000,
                });
              }
              this.uploadingBannerImage = false;
              this.bannerImageChangedEvent = null;
              this.croppedBannerImage = null;
            },
            error: (error: { error?: { message?: string } }) => {
              this.uploadingBannerImage = false;
              this.snackBar.open(
                error.error?.message || 'Upload failed',
                'Close',
                { duration: 3000 },
              );
            },
          });
      });
  }

  deleteBannerImage(): void {
    if (!confirm('Delete your banner image?')) return;

    this.showBannerMenu = false;
    this.uploadingBannerImage = true;

    this.userProfileService
      .deleteBannerImage()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.updatedBasicInfo.emit(response.data);
            this.snackBar.open('Banner image deleted', 'Close', {
              duration: 2000,
            });
          }
          this.uploadingBannerImage = false;
        },
        error: () => {
          this.uploadingBannerImage = false;
          this.snackBar.open('Delete failed', 'Close', { duration: 3000 });
        },
      });
  }

  closeImagePreview(): void {
    this.showImagePreview = false;
    this.previewImageUrl = null;
  }

  getInitials(): string {
    if (!this.profile) return '';
    return `${this.profile.firstName.charAt(0)}${this.profile.lastName.charAt(0)}`.toUpperCase();
  }

  hasFieldError(fieldName: string): boolean {
    const control = this.basicInfoForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  getFieldError(fieldName: string): string {
    const control = this.basicInfoForm.get(fieldName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return 'This field is required';
    if (control.errors['minlength'])
      return `Minimum ${control.errors['minlength'].requiredLength} characters`;
    if (control.errors['maxlength'])
      return `Maximum ${control.errors['maxlength'].requiredLength} characters`;
    if (control.errors['pattern']) {
      if (fieldName === 'phone') return 'Invalid phone format';
      if (fieldName === 'address.postalCode') return 'Invalid postal code';
    }
    return '';
  }
}
