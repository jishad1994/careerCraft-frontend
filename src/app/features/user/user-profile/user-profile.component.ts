import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  Education,
  Experience,
  UserProfile,
} from '../../../models/user-profile.model';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserProfileService } from '../../../services/user/profile/user-profile.service';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent implements OnInit, OnDestroy {
  profile: UserProfile | null = null;
  loading = false;
  editMode = false;
  uploadingImage = false;
  showImageMenu = false;

  profileForm!: FormGroup;
  destroy$ = new Subject<void>();
  constructor(
    private _userProfileService: UserProfileService,
    private fb: FormBuilder,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadProfile();
  }

  initForm(): void {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      role: ['user', Validators.required],
      about: [''],
      location: [''],
      address: [''],
      skills: this.fb.array([]),
      education: this.fb.array([]),
      experience: this.fb.array([]),
    });
  }

  loadProfile(): void {
    this.loading = true;
    this._userProfileService
      .getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.profile = response.data;
          this.patchFormValues();
          this.loading = false;
        },
        error: (err) => {
          this._snackBar.open(err.message, 'close', { duration: 20000 });
          this.loading = false;
        },
      });
  }

  patchFormValues(): void {
    if (!this.profile) return;

    this.profileForm.patchValue({
      firstName: this.profile.firstName,
      lastName: this.profile.lastName,
      email: this.profile.email,
      phone: this.profile.phone,
      role: this.profile.role,
      about: this.profile.about,
      location: this.profile.location,
      address: this.profile.address,
    });

    this.profile.skills.forEach((skill) => {
      this.skills.push(
        this.fb.group({
          id: [skill._id],
          name: [skill.name, Validators.required],
        })
      );
    });

    this.profile.education.forEach((edu) => {
      this.educationList.push(this.createEducationGroup(edu));
    });

    this.profile.experience.forEach((exp) => {
      this.experienceList.push(this.createExperienceGroup(exp));
    });
  }

  get skills(): FormArray {
    return this.profileForm.get('skills') as FormArray;
  }

  get educationList(): FormArray {
    return this.profileForm.get('education') as FormArray;
  }

  get experienceList(): FormArray {
    return this.profileForm.get('experience') as FormArray;
  }

  createEducationGroup(edu?: Education): FormGroup {
    return this.fb.group({
      type: [edu?.type || '', Validators.required],
      institution: [edu?.institution || '', Validators.required],
      fieldOfStudy: [edu?.fieldOfStudy || '', Validators.required],
      startDate: [edu?.startDate || '', Validators.required],
      endDate: [edu?.endDate || ''],
      isCurrent: [edu?.isCurrent || false],
      grade: [edu?.grade || ''],
    });
  }

  createExperienceGroup(exp?: Experience): FormGroup {
    return this.fb.group({
      jobTitle: [exp?.jobTitle || '', Validators.required],
      company: [exp?.company || '', Validators.required],
      startDate: [exp?.startDate || '', Validators.required],
      endDate: [exp?.endDate || ''],
      isCurrent: [exp?.isCurrent || false],
      description: [exp?.description || ''],
    });
  }

  addSkill(): void {
    this.skills.push(
      this.fb.group({
        id: [''],
        name: ['', Validators.required],
      })
    );
  }

  removeSkill(index: number): void {
    this.skills.removeAt(index);
  }

  
  addEducation(): void {
    this.educationList.push(this.createEducationGroup());
  }

  removeEducation(index: number): void {
    this.educationList.removeAt(index);
  }

  addExperience(): void {
    this.experienceList.push(this.createExperienceGroup());
  }

  removeExperience(index: number): void {
    this.experienceList.removeAt(index);
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      this.patchFormValues();
    }
  }

  onSave(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    const formData = this.profileForm.value;

    this._userProfileService
      .updateProfile(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.profile = response.data;
          this.editMode = false;
          this.loading = false;

          this._snackBar.open('user profile updated successfully', 'close', {
            duration: 2000,
          });
        },
        error: (err) => {
          console.log(err.message);
          this.loading = false;
          this._snackBar.open(err.message, 'close', { duration: 3000 });
        },
      });
  }
  //profile image methods
  onSelectImage(): void {
    const fileInput = document.getElementById(
      'profilePictureInput'
    ) as HTMLInputElement;
    fileInput?.click();
    this.showImageMenu = false;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        this._snackBar.open('Please select a image file', 'close', {
          duration: 3000,
        });
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
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
    this._userProfileService
      .updateProfilePicture(file)
      .pipe(takeUntil(this.destroy$))

      .subscribe({
        next: (response) => {
          if (this.profile) {
            this.profile.profilePicture = response.data?.profilePicture;
          }
          this.uploadingImage = false;
          this._snackBar.open('Profile picture updated successfully', 'close', {
            duration: 2000,
          });
        },
        error: (err) => {
          this.uploadingImage = false;
          console.log(err.message);
          this._snackBar.open(err.message, 'close', { duration: 2000 });
        },
      });
  }

  deleteProfilePicture(): void {
    if (!confirm('Are you sure you want to delete you profile picture?')) {
      return;
    }

    this.showImageMenu = false;
    this.uploadingImage = true;
    this._userProfileService
      .deleteProfilePicture()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (this.profile) {
            this.profile.profilePicture = '';
          }
          this.uploadingImage = false;

          this._snackBar.open('Profile picture deleted successfully', 'close', {
            duration: 200,
          });
        },
        error: (err) => {
          console.log(err.message);
          this._snackBar.open('Failed to delete profile picture', 'close', {
            duration: 2000,
          });
        },
      });
  }

  toggleImageMenu(): void {
    this.showImageMenu = !this.showImageMenu;
  }

  getInitials(): string {
    if (!this.profile) return '';
    return `${this.profile.firstName[0]}${this.profile.lastName[0]}`.toUpperCase();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
