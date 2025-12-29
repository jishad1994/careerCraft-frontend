import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { UserProfileService } from '../../../../services/user/profile/user-profile.service';
import { Experience, UserProfile } from '../../../../models/user-profile.model';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-experience-section',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './experience-section.component.html',
  styleUrl: './experience-section.component.css',
})
export class ExperienceSectionComponent implements OnInit, OnDestroy {
  @Input() profile: UserProfile | null = null;

  @Output() updatedExperience = new EventEmitter<UserProfile>();

  experienceForm!: FormGroup;
  editingExperience: number | null = null;
  addingExperience: boolean = false;
  loading = false;

  destroy$ = new Subject<void>();

  constructor(
    private _userProfileService: UserProfileService,
    private _fb: FormBuilder,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.experienceForm = this._fb.group({
      jobTitle: ['', Validators.required],
      company: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
      isCurrent: [false],
      description: [''],
    });
  }

  startAddExperience(): void {
    this.addingExperience = true;
    this.experienceForm.reset({ isCurrent: false });
  }

  startEditExperience(index: number): void {
    this.editingExperience = index;
    const experienceToUpdate = this.profile!.experience[index];
    this.experienceForm.patchValue(experienceToUpdate);
  }

  cancelAddExperience(): void {
    this.addingExperience = false;
    this.experienceForm.reset();
  }

  cancelEditExperience() {
    this.editingExperience = null;
    this.experienceForm.reset();
  }

  saveExperience(): void {
    if (this.experienceForm.invalid) {
      this.experienceForm.markAllAsTouched();
      return;
    }

    const experience = this.experienceForm.value;
    this.loading = true;
    this._userProfileService
      .addExperience(experience)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.addingExperience = false;
          this.updatedExperience.emit(response.data as UserProfile);
          this.experienceForm.reset();
          this.loading = false;

          this._snackBar.open('Experience added successfully', 'close', {
            duration: 2000,
          });
        },
        error: (err) => {
          this.loading = false;
          this._snackBar.open(
            err.error?.message || 'Failed to add experience',
            'close',
            { duration: 3000 }
          );
        },
      });
  }

  updateExperience(index: number): void {
    if (this.experienceForm.invalid) {
      this.experienceForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this._userProfileService
      .updateExperience(index,this.experienceForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.updatedExperience.emit(response.data as UserProfile);
          this.editingExperience = null;
          this.loading = false;
          this._snackBar.open('Experience updated successfully', 'close', {
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

  deleteExperience(index: number): void {
    if (!confirm('Delete this experience entry?')) return;

    this.loading = true;
    this._userProfileService
      .deleteExperience(index)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.updatedExperience.emit(response.data as UserProfile);
          this.loading = false;
          this._snackBar.open('Experience deleted', 'close', {
            duration: 2000,
          });
        },
        error: (err) => {
          this.loading = false;
          this._snackBar.open('Delete failed', 'close', { duration: 3000 });
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  }
}
