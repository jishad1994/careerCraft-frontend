import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { UserProfile } from '../../../../models/user/user-profile.model';
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

  private destroy$ = new Subject<void>();

  constructor(
    private _fb: FormBuilder,
    private _userProfileService: UserProfileService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.educationForm = this._fb.group({
      type: ['', Validators.required],
      institution: ['', [Validators.required, Validators.minLength(2)]],
      fieldOfStudy: ['', [Validators.required, Validators.minLength(2)]],
      startDate: ['', Validators.required],
      endDate: [''],
      isCurrent: [false],
      grade: [''],
    });

    // Dynamic validation for endDate - not required if currently studying
    this.educationForm.get('isCurrent')?.valueChanges.subscribe((isCurrent) => {
      const endDateControl = this.educationForm.get('endDate');
      
      if (isCurrent) {
        endDateControl?.clearValidators();
        endDateControl?.setValue('');
      }
      
      endDateControl?.updateValueAndValidity();
    });
  }

  startAddEducation(): void {
    this.addingEducation = true;
    this.educationForm.reset({ isCurrent: false });
  }

  cancelAddEducation(): void {
    this.addingEducation = false;
    this.educationForm.reset({ isCurrent: false });
  }

  cancelEditEducation(): void {
    this.editingEducation = null;
    this.educationForm.reset({ isCurrent: false });
  }

  startEditEducation(index: number): void {
    this.editingEducation = index;
    const edu = this.profile!.education[index];
    
    // Format dates for date input (YYYY-MM-DD)
    const formattedEducation = {
      ...edu,
      startDate: this.formatDateForInput(edu.startDate),
      endDate: edu.endDate ? this.formatDateForInput(edu.endDate) : '',
    };
    
    this.educationForm.patchValue(formattedEducation);
  }

  saveEducation(): void {
    if (this.educationForm.invalid) {
      this.educationForm.markAllAsTouched();
      this._snackBar.open('Please fill in all required fields', 'Close', {
        duration: 3000,
      });
      return;
    }

    const education = this.prepareEducationData();
    this.loading = true;

    this._userProfileService
      .addEducation(education)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.addingEducation = false;
          this.updatedEducation.emit(response.data as UserProfile);
          this.educationForm.reset({ isCurrent: false });
          this.loading = false;
          this._snackBar.open('Education added successfully', 'Close', {
            duration: 2000,
          });
        },
        error: (err) => {
          this.loading = false;
          this._snackBar.open(
            err.error?.message || 'Failed to add education',
            'Close',
            { duration: 3000 }
          );
        },
      });
  }

  updateEducation(index: number): void {
    if (this.educationForm.invalid) {
      this.educationForm.markAllAsTouched();
      this._snackBar.open('Please fill in all required fields', 'Close', {
        duration: 3000,
      });
      return;
    }

    const education = this.prepareEducationData();
    this.loading = true;

    this._userProfileService
      .updateEducation(index, education)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.editingEducation = null;
          this.educationForm.reset({ isCurrent: false });
          this.loading = false;
          this.updatedEducation.emit(response.data as UserProfile);
          this._snackBar.open('Education updated successfully', 'Close', {
            duration: 2000,
          });
        },
        error: (err) => {
          this.loading = false;
          this._snackBar.open(
            err.error?.message || 'Update failed',
            'Close',
            { duration: 3000 }
          );
        },
      });
  }

  deleteEducation(index: number): void {
    if (!confirm('Are you sure you want to delete this education entry?')) return;

    this.loading = true;

    this._userProfileService
      .deleteEducation(index)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.updatedEducation.emit(response.data as UserProfile);
          this._snackBar.open('Education deleted successfully', 'Close', {
            duration: 2000,
          });
        },
        error: () => {
          this.loading = false;
          this._snackBar.open('Delete failed', 'Close', { duration: 3000 });
        },
      });
  }

  // Helper method to prepare education data
  private prepareEducationData(): any {
    const formValue = this.educationForm.value;
    return {
      ...formValue,
      // Convert date strings to Date objects
      startDate: new Date(formValue.startDate),
      endDate: formValue.isCurrent || !formValue.endDate ? undefined : new Date(formValue.endDate),
    };
  }

  // Format date for display (e.g., "Jan 2020")
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  }

  // Format date for input field (YYYY-MM-DD)
  private formatDateForInput(dateString: string | Date): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}