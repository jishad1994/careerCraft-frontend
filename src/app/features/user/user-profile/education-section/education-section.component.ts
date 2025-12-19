import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { UserProfile } from '../../../../models/user-profile.model';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserProfileService } from '../../../../services/user/profile/user-profile.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-education-section',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './education-section.component.html',
  styleUrl: './education-section.component.css',
})
export class EducationSectionComponent implements OnInit, OnDestroy {
  @Input() profile: UserProfile | null = null;

  @Output() updatedEducation = new EventEmitter<UserProfile>();

  educationForm!: FormGroup;

  editingEducation: number | null = null;
  addingEducation = false;
  loading = false;
  destroy$ = new Subject<void>();

  constructor(
    private _fb: FormBuilder,
    private _userProfileService: UserProfileService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.educationForm = this._fb.group({
      type: ['', Validators.required],
      institution: ['', Validators.required],
      fieldOfStudy: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
      isCurrent: [false],
      grade: [''],
    });
  }

  startAddEducation(): void {
    this.addingEducation = true;
    this.educationForm.reset({ isCurrent: false });
  }

  cancelAddEducation(): void {
    this.addingEducation = false;
    this.educationForm.reset();
  }

  cancelEditEducation(): void {
    this.editingEducation = null;
    this.educationForm.reset();
  }

  startEditEducation(index: number): void {
    this.editingEducation = index;
    const edu = this.profile!.education[index];
    this.educationForm.patchValue(edu);
  }

  saveEducation(): void {
    if (this.educationForm.invalid) {
      this.educationForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this._userProfileService
      .addEducation(this.educationForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.addingEducation = false;
          this.updatedEducation.emit(response.data as UserProfile);
          this.educationForm.reset();
          this.loading = false;

          this._snackBar.open('Education added successfully', 'close', {
            duration: 2000,
          });
        },
        error: (err) => {
          this.loading = false;
          this._snackBar.open(
            err.error?.message || 'Failed to add education',
            'close',
            { duration: 3000 }
          );
        },
      });
  }

  updateEducation(index: number): void {
    if (this.educationForm.invalid) {
      this.educationForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    this._userProfileService
      .updateEducation(index, this.educationForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.editingEducation = null;
          this.loading = false;
          this.updatedEducation.emit(response.data as UserProfile);
          this._snackBar.open('Education updated successfully', 'close', {
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

  deleteEducation(index: number): void {
    if (!confirm('Delete this education entry?')) return;

    this.loading = true;

    this._userProfileService
      .deleteEducation(index)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.updatedEducation.emit(response.data as UserProfile);
          this._snackBar.open('Education deleted', 'close', { duration: 2000 });
        },
        error: (err) => {
          this.loading = false;
          this._snackBar.open('Delete failed', 'close', { duration: 3000 });
        },
      });
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
