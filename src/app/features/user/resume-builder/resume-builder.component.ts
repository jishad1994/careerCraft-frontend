import { Component, OnDestroy, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Subject, catchError, debounceTime, EMPTY, switchMap, takeUntil, tap } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";

import { ResumeBuilderService } from "../../../services/user/resume-builder/resume-builder.service";
import {
    ResumeData,
    ResumeEducation,
    ResumeExperience,
    ResumeSkill,
    ResumeTemplate,
    ResumeTemplateId,
    SavedResumeResponse,
} from "../../../models/user/user-resume.model";
import { ResumePreviewComponent } from "../resume-preview/resume-preview.component";
import { TemplateSelectorComponent } from "../template-selector/template-selector.component";

/** How long (ms) after the user stops typing before we auto-save */
const AUTO_SAVE_DEBOUNCE_MS = 1500;

@Component({
    selector: "app-resume-builder",
    imports: [CommonModule, ReactiveFormsModule, ResumePreviewComponent, TemplateSelectorComponent],
    templateUrl: "./resume-builder.component.html",
    styleUrl: "./resume-builder.component.css",
})
export class ResumeBuilderComponent implements OnInit, OnDestroy {
    private fb = inject(FormBuilder);
    private resumeService = inject(ResumeBuilderService);
    private snackBar = inject(MatSnackBar);

    resumeForm!: FormGroup;
    templates: ResumeTemplate[] = [];
    selectedTemplate: ResumeTemplateId = "classic";

    // Loading / action states
    loadingDraft = false;
    loadingProfile = false;
    loadingTemplates = false;
    generatingPdf = false;
    uploading = false;

    // Auto-save feedback
    autoSaving = false;
    lastSavedAt: Date | null = null;

    // FIX: Initialize previewData with a safe default so the template
    // never passes undefined to the child component
    previewData: ResumeData = {
        personalInfo: {
            fullName: "",
            email: "",
            phone: "",
            location: "",
            linkedIn: "",
            portfolio: "",
        },
        summary: { text: "" },
        experience: [],
        education: [],
        skills: [],
        templateId: "classic",
    };

    // Validation error messages shown above buttons
    validationErrors: string[] = [];

    private suppressAutoSaveCount = 0;

    private destroy$ = new Subject<void>();
    private savetrigger$ = new Subject<ResumeData>();

    // ────────────────────────────────────────────────────────────
    // Lifecycle
    // ────────────────────────────────────────────────────────────

    ngOnInit(): void {
        this.initForm();
        this.computePreview();
        this.loadTemplates();
        this.setupAutoSave();
        this.loadDraft();

        // Live preview + auto-save trigger on every value change
        this.resumeForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.computePreview();

            // Clear validation errors as user types
            if (this.validationErrors.length > 0) {
                this.validationErrors = this.getValidationErrors();
            }

            if (this.suppressAutoSaveCount > 0) {
                this.suppressAutoSaveCount--;
                return;
            }

            this.savetrigger$.next(this.buildResumeData());
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ────────────────────────────────────────────────────────────
    // Form initialisation
    // ────────────────────────────────────────────────────────────

    private initForm(): void {
        this.resumeForm = this.fb.group({
            personalInfo: this.fb.group({
                fullName: ["", Validators.required],
                email: ["", [Validators.required, Validators.email]],
                phone: [""],
                location: [""],
                linkedIn: [""],
                portfolio: [""],
            }),
            summary: this.fb.group({
                text: [""],
            }),
            experience: this.fb.array([]),
            education: this.fb.array([]),
            skills: this.fb.array([]),
        });
    }

    // ────────────────────────────────────────────────────────────
    // Auto-save pipeline
    // ────────────────────────────────────────────────────────────

    private setupAutoSave(): void {
        this.savetrigger$
            .pipe(
                debounceTime(AUTO_SAVE_DEBOUNCE_MS),
                tap(() => (this.autoSaving = true)),
                switchMap((data) =>
                    this.resumeService.saveDraft(data).pipe(
                        catchError(() => {
                            this.autoSaving = false;
                            console.error("Auto-save failed");
                            return EMPTY;
                        }),
                    ),
                ),
                takeUntil(this.destroy$),
            )
            .subscribe({
                next: (res) => {
                    this.autoSaving = false;
                    this.lastSavedAt = new Date(res.data.lastSavedAt);
                },
            });
    }

    // ────────────────────────────────────────────────────────────
    // Draft loading
    // ────────────────────────────────────────────────────────────

    private loadDraft(): void {
        this.loadingDraft = true;

        this.resumeService
            .getDraft()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.data) {
                        this.patchFormFromDraft(res.data);
                        this.selectedTemplate = res.data.templateId;
                        this.lastSavedAt = new Date(res.data.lastSavedAt);
                    }
                    this.loadingDraft = false;
                },
                error: () => {
                    this.loadingDraft = false;
                },
            });
    }

    // ────────────────────────────────────────────────────────────
    // Patch form from draft / profile data
    // ────────────────────────────────────────────────────────────

    private patchFormFromDraft(
        d:
            | SavedResumeResponse
            | {
                  personalInfo: ResumeData["personalInfo"];
                  summary: ResumeData["summary"];
                  experience: ResumeExperience[];
                  education: ResumeEducation[];
                  skills: ResumeSkill[];
              },
    ): void {
        // ── 1. Rebuild arrays silently (no valueChanges fired) ──

        // Experience
        this.experienceArray.clear({ emitEvent: false });
        d.experience.forEach((exp) => {
            const group = this.createExperienceGroup(exp);
            this.experienceArray.push(group, { emitEvent: false });
        });

        // Education
        this.educationArray.clear({ emitEvent: false });
        d.education.forEach((edu) => {
            const group = this.createEducationGroup(edu);
            this.educationArray.push(group, { emitEvent: false });
        });

        // Skills
        this.skillsArray.clear({ emitEvent: false });
        d.skills.forEach((s) => {
            this.skillsArray.push(
                this.fb.group({
                    name: [s.name],
                    category: [""],
                }),
                { emitEvent: false },
            );
        });

        // ── 2. Patch simple fields — fires exactly ONE emission ──
        this.suppressAutoSaveCount = 1;
        this.resumeForm.patchValue({
            personalInfo: d.personalInfo,
            summary: d.summary,
        });
    }

    // ────────────────────────────────────────────────────────────
    // Factory helpers (centralised group creation + isCurrent wiring)
    // ────────────────────────────────────────────────────────────

    /**
     * Creates an experience FormGroup and wires the isCurrent ↔ endDate
     * toggle so we never use [disabled] in the template (which conflicts
     * with reactive forms).
     */
    private createExperienceGroup(exp: Partial<ResumeExperience> = {}): FormGroup {
        const group = this.fb.group({
            jobTitle: [exp.jobTitle ?? "", Validators.required],
            company: [exp.company ?? "", Validators.required],
            startDate: [exp.startDate ?? "", Validators.required],
            endDate: [{ value: exp.endDate ?? "", disabled: !!exp.isCurrent }],
            isCurrent: [exp.isCurrent ?? false],
            description: [exp.description ?? ""],
            achievements: this.fb.array((exp.achievements ?? []).map((a) => this.fb.control(a))),
        });

        // FIX: Reactively toggle endDate enabled/disabled from TS
        group
            .get("isCurrent")!
            .valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe((isCurrent: boolean | null) => {
                const endDate = group.get("endDate")!;
                if (isCurrent) {
                    endDate.disable({ emitEvent: false });
                    endDate.setValue("", { emitEvent: false });
                } else {
                    endDate.enable({ emitEvent: false });
                }
            });

        return group;
    }

    /**
     * Creates an education FormGroup with the same isCurrent ↔ endDate
     * toggle pattern.
     */
    private createEducationGroup(edu: Partial<ResumeEducation> = {}): FormGroup {
        const group = this.fb.group({
            degree: [edu.degree ?? "", Validators.required],
            institution: [edu.institution ?? "", Validators.required],
            fieldOfStudy: [edu.fieldOfStudy ?? "", Validators.required],
            startDate: [edu.startDate ?? "", Validators.required],
            endDate: [{ value: edu.endDate ?? "", disabled: !!edu.isCurrent }],
            isCurrent: [edu.isCurrent ?? false],
            grade: [edu.grade ?? ""],
        });

        // FIX: Reactively toggle endDate enabled/disabled from TS
        group
            .get("isCurrent")!
            .valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe((isCurrent: boolean | null) => {
                const endDate = group.get("endDate")!;
                if (isCurrent) {
                    endDate.disable({ emitEvent: false });
                    endDate.setValue("", { emitEvent: false });
                } else {
                    endDate.enable({ emitEvent: false });
                }
            });

        return group;
    }

    // ────────────────────────────────────────────────────────────
    // FormArray accessors
    // ────────────────────────────────────────────────────────────

    get experienceArray(): FormArray {
        return this.resumeForm.get("experience") as FormArray;
    }

    get educationArray(): FormArray {
        return this.resumeForm.get("education") as FormArray;
    }

    get skillsArray(): FormArray {
        return this.resumeForm.get("skills") as FormArray;
    }

    // ────────────────────────────────────────────────────────────
    // Experience CRUD
    // ────────────────────────────────────────────────────────────

    addExperience(): void {
        this.experienceArray.push(this.createExperienceGroup());
    }

    removeExperience(index: number): void {
        this.experienceArray.removeAt(index);
    }

    getAchievements(expIndex: number): FormArray {
        return this.experienceArray.at(expIndex).get("achievements") as FormArray;
    }

    addAchievement(expIndex: number): void {
        this.getAchievements(expIndex).push(this.fb.control(""));
    }

    removeAchievement(expIndex: number, achIndex: number): void {
        this.getAchievements(expIndex).removeAt(achIndex);
    }

    // ────────────────────────────────────────────────────────────
    // Education CRUD
    // ────────────────────────────────────────────────────────────

    addEducation(): void {
        this.educationArray.push(this.createEducationGroup());
    }

    removeEducation(index: number): void {
        this.educationArray.removeAt(index);
    }

    // ────────────────────────────────────────────────────────────
    // Skills CRUD
    // ────────────────────────────────────────────────────────────

    addSkill(): void {
        this.skillsArray.push(
            this.fb.group({
                name: [""],
                category: [""],
            }),
        );
    }

    removeSkill(index: number): void {
        this.skillsArray.removeAt(index);
    }

    // ────────────────────────────────────────────────────────────
    // Template selection
    // ────────────────────────────────────────────────────────────

    onTemplateSelected(id: ResumeTemplateId): void {
        this.selectedTemplate = id;
        this.computePreview();

        // Template change should also trigger auto-save
        this.savetrigger$.next(this.buildResumeData());
    }

    // ────────────────────────────────────────────────────────────
    // Template loading
    // ────────────────────────────────────────────────────────────

    private loadTemplates(): void {
        this.loadingTemplates = true;
        this.resumeService
            .getTemplates()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.templates = res.data;
                    this.loadingTemplates = false;
                },
                error: () => {
                    this.templates = [
                        {
                            id: "classic",
                            name: "Classic",
                            description: "Traditional serif layout",
                        },
                        {
                            id: "modern",
                            name: "Modern",
                            description: "Clean contemporary design",
                        },
                        {
                            id: "minimal",
                            name: "Minimal",
                            description: "Ultra-clean whitespace",
                        },
                    ];
                    this.loadingTemplates = false;
                },
            });
    }

    // ────────────────────────────────────────────────────────────
    // Populate from profile
    // ────────────────────────────────────────────────────────────

    populateFromProfile(): void {
        this.loadingProfile = true;
        this.resumeService
            .getProfileData()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.patchFormFromDraft(res.data);
                    this.loadingProfile = false;

                    // Immediately save the profile-populated data
                    this.savetrigger$.next(this.buildResumeData());

                    this.snackBar.open("Profile data loaded successfully", "Close", { duration: 3000 });
                },
                error: (err) => {
                    this.loadingProfile = false;
                    this.snackBar.open(err.error?.message ?? "Failed to load profile data", "Close", { duration: 4000 });
                },
            });
    }

    // ────────────────────────────────────────────────────────────
    // PDF generation
    // ────────────────────────────────────────────────────────────

    generatePdf(): void {
        this.validationErrors = this.getValidationErrors();
        if (this.validationErrors.length > 0) {
            this.resumeForm.markAllAsTouched();
            return;
        }

        this.generatingPdf = true;
        const resumeData = this.buildResumeData();

        this.resumeService
            .generatePdf(resumeData)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (blob) => {
                    this.downloadBlob(blob, `${resumeData.personalInfo.fullName.replace(/\s+/g, "_")}_Resume.pdf`);
                    this.generatingPdf = false;
                    this.snackBar.open("PDF downloaded!", "Close", {
                        duration: 3000,
                    });
                },
                error: () => {
                    this.generatingPdf = false;
                    this.snackBar.open("Failed to generate PDF", "Close", {
                        duration: 4000,
                    });
                },
            });
    }

    // ────────────────────────────────────────────────────────────
    // Upload resume
    // ────────────────────────────────────────────────────────────

    uploadResume(): void {
        this.validationErrors = this.getValidationErrors();
        if (this.validationErrors.length > 0) {
            this.resumeForm.markAllAsTouched();
            return;
        }

        this.uploading = true;
        const resumeData = this.buildResumeData();

        this.resumeService
            .uploadResume(resumeData)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.uploading = false;
                    this.snackBar.open("Resume uploaded to your profile!", "Close", { duration: 3000 });
                },
                error: (err) => {
                    this.uploading = false;
                    this.snackBar.open(err.error?.message ?? "Upload failed", "Close", { duration: 4000 });
                },
            });
    }

    // ────────────────────────────────────────────────────────────
    // Data builders
    // ────────────────────────────────────────────────────────────

    /**
     * FIX: Use getRawValue() which includes disabled controls (endDate
     * when isCurrent is true). Without this, disabled endDate fields
     * would be omitted from the built data.
     */
    private buildResumeData(): ResumeData {
        const raw = this.resumeForm.getRawValue();
        return {
            ...raw,
            templateId: this.selectedTemplate,
            experience: raw.experience.map((exp: Record<string, unknown> & { achievements: string[] }) => ({
                ...exp,
                achievements: (exp.achievements ?? []).filter((a: string) => a.trim() !== ""),
            })),
            // Filter out empty skill entries
            skills: raw.skills.filter((s: { name: string }) => s.name.trim() !== ""),
        } as ResumeData;
    }

    private computePreview(): void {
        this.previewData = this.buildResumeData();
    }

    private downloadBlob(blob: Blob, fileName: string): void {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ────────────────────────────────────────────────────────────
    // Validation helpers
    // ────────────────────────────────────────────────────────────

    /**
     * Collects human-readable validation error messages by walking the
     * form tree. This tells the user exactly which fields need attention.
     */
    getValidationErrors(): string[] {
        const errors: string[] = [];
        const pi = this.resumeForm.get("personalInfo") as FormGroup;

        if (pi.get("fullName")?.invalid) {
            errors.push("Full Name is required");
        }
        if (pi.get("email")?.invalid) {
            const emailCtrl = pi.get("email")!;
            if (emailCtrl.hasError("required")) {
                errors.push("Email is required");
            } else if (emailCtrl.hasError("email")) {
                errors.push("Email format is invalid");
            }
        }

        // Experience validation
        const expArray = this.experienceArray;
        for (let i = 0; i < expArray.length; i++) {
            const exp = expArray.at(i) as FormGroup;
            const label = `Experience ${i + 1}`;
            if (exp.get("jobTitle")?.invalid) {
                errors.push(`${label}: Job Title is required`);
            }
            if (exp.get("company")?.invalid) {
                errors.push(`${label}: Company is required`);
            }
            if (exp.get("startDate")?.invalid) {
                errors.push(`${label}: Start Date is required`);
            }
        }

        // Education validation
        const eduArray = this.educationArray;
        for (let i = 0; i < eduArray.length; i++) {
            const edu = eduArray.at(i) as FormGroup;
            const label = `Education ${i + 1}`;
            if (edu.get("degree")?.invalid) {
                errors.push(`${label}: Degree is required`);
            }
            if (edu.get("institution")?.invalid) {
                errors.push(`${label}: Institution is required`);
            }
            if (edu.get("fieldOfStudy")?.invalid) {
                errors.push(`${label}: Field of Study is required`);
            }
            if (edu.get("startDate")?.invalid) {
                errors.push(`${label}: Start Date is required`);
            }
        }

        return errors;
    }

    hasError(path: string): boolean {
        const control = this.resumeForm.get(path);
        return !!control && control.invalid && control.touched;
    }

    formatLastSaved(): string {
        if (!this.lastSavedAt) return "";
        return this.lastSavedAt.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    }
}
