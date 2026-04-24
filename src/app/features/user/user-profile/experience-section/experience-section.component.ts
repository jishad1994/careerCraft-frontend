import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from "@angular/core";
import { UserProfileService } from "../../../../services/user/profile/user-profile.service";
import { UserProfile } from "../../../../models/user/user-profile.model";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Subject, takeUntil } from "rxjs";

export interface ExperienceData {
    jobTitle: string;
    company: string;
    startDate: Date;
    endDate?: Date; // optional because of "isCurrent"
    isCurrent: boolean;
    description?: string;
}

@Component({
    selector: "app-experience-section",
    imports: [ReactiveFormsModule, CommonModule],
    templateUrl: "./experience-section.component.html",
    styleUrl: "./experience-section.component.css",
})
export class ExperienceSectionComponent implements OnInit, OnDestroy {
    private _userProfileService = inject(UserProfileService);
    private _fb = inject(FormBuilder);
    private _snackBar = inject(MatSnackBar);

    @Input() profile: UserProfile | null = null;
    @Output() updatedExperience = new EventEmitter<UserProfile>();

    experienceForm!: FormGroup;
    editingExperience: number | null = null;
    addingExperience = false;
    totalYearsOfExperience = 0;
    loading = false;

    private destroy$ = new Subject<void>();

    ngOnInit(): void {
        this.initForm();
        this.totalYearsOfExperience = Math.abs(this.profile?.totalExperienceYears ?? 0);
    }

    initForm(): void {
        this.experienceForm = this._fb.group({
            jobTitle: ["", [Validators.required, Validators.minLength(2)]],
            company: ["", [Validators.required, Validators.minLength(2)]],
            startDate: ["", Validators.required],
            endDate: [""],
            isCurrent: [false],
            description: ["", Validators.maxLength(500)],
        });

        this.experienceForm.get("isCurrent")?.valueChanges.subscribe((isCurrent) => {
            const endDateControl = this.experienceForm.get("endDate");

            if (isCurrent) {
                endDateControl?.clearValidators();
                endDateControl?.setValue("");
            } else {
                endDateControl?.setValidators([Validators.required]);
            }

            endDateControl?.updateValueAndValidity();
        });
    }

    startAddExperience(): void {
        this.addingExperience = true;
        this.experienceForm.reset({ isCurrent: false });
    }

    startEditExperience(index: number): void {
        this.editingExperience = index;
        const experienceToUpdate = this.profile!.experience[index];

        const formattedExperience = {
            ...experienceToUpdate,
            startDate: this.formatDateForInput(experienceToUpdate.startDate),
            endDate: experienceToUpdate.endDate ? this.formatDateForInput(experienceToUpdate.endDate) : "",
        };

        this.experienceForm.patchValue(formattedExperience);
    }

    cancelAddExperience(): void {
        this.addingExperience = false;
        this.experienceForm.reset({ isCurrent: false });
    }

    cancelEditExperience(): void {
        this.editingExperience = null;
        this.experienceForm.reset({ isCurrent: false });
    }

    saveExperience(): void {
        if (this.experienceForm.invalid) {
            this.experienceForm.markAllAsTouched();
            this._snackBar.open("Please fill in all required fields", "Close", {
                duration: 3000,
            });
            return;
        }

        const experience = this.prepareExperienceData();
        this.loading = true;

        this._userProfileService
            .addExperience(experience)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.addingExperience = false;
                    this.updatedExperience.emit(response.data as UserProfile);
                    this.experienceForm.reset({ isCurrent: false });
                    this.loading = false;
                    this._snackBar.open("Experience added successfully", "Close", {
                        duration: 2000,
                    });
                },
                error: (err) => {
                    this.loading = false;
                    this._snackBar.open(err.error?.message || "Failed to add experience", "Close", { duration: 3000 });
                },
            });
    }

    updateExperience(index: number): void {
        if (this.experienceForm.invalid) {
            this.experienceForm.markAllAsTouched();
            this._snackBar.open("Please fill in all required fields", "Close", {
                duration: 3000,
            });
            return;
        }

        const experience = this.prepareExperienceData();
        this.loading = true;

        this._userProfileService
            .updateExperience(index, experience)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.updatedExperience.emit(response.data as UserProfile);
                    this.editingExperience = null;
                    this.experienceForm.reset({ isCurrent: false });
                    this.loading = false;
                    this._snackBar.open("Experience updated successfully", "Close", {
                        duration: 2000,
                    });
                },
                error: (err) => {
                    this.loading = false;
                    this._snackBar.open(err.error?.message || "Update failed", "Close", { duration: 3000 });
                },
            });
    }

    deleteExperience(index: number): void {
        if (!confirm("Are you sure you want to delete this experience?")) return;

        this.loading = true;

        this._userProfileService
            .deleteExperience(index)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.updatedExperience.emit(response.data as UserProfile);
                    this.loading = false;
                    this._snackBar.open("Experience deleted successfully", "Close", {
                        duration: 2000,
                    });
                },
                error: () => {
                    this.loading = false;
                    this._snackBar.open("Delete failed", "Close", { duration: 3000 });
                },
            });
    }

    private prepareExperienceData(): ExperienceData {
        const formValue = this.experienceForm.value;

        return {
            jobTitle: formValue.jobTitle,
            company: formValue.company,
            isCurrent: formValue.isCurrent,
            description: formValue.description,
            startDate: new Date(formValue.startDate),
            endDate: formValue.isCurrent ? undefined : new Date(formValue.endDate),
        };
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
        });
    }

    private formatDateForInput(dateString: string | Date): string {
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
