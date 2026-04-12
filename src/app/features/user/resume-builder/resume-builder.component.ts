
import { Component, OnDestroy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
    FormArray,
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from "@angular/forms";
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
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ResumePreviewComponent,
        TemplateSelectorComponent,
    ],
    templateUrl: "./resume-builder.component.html",
    styleUrl: "./resume-builder.component.css",
})
export class ResumeBuilderComponent implements OnInit, OnDestroy {
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

    // Derived live-preview data (recomputed on every form change)
    previewData!: ResumeData;

   
    private suppressAutoSaveCount = 0;

    private destroy$ = new Subject<void>();
    private savetrigger$ = new Subject<ResumeData>();

    constructor(
        private fb: FormBuilder,
        private resumeService: ResumeBuilderService,
        private snackBar: MatSnackBar
    ) {}


    ngOnInit(): void {
        this.initForm();
        this.computePreview();
        this.loadTemplates();
        this.setupAutoSave();
        this.loadDraft();

        // Live preview + auto-save trigger on every value change
        this.resumeForm.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.computePreview();

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
                        })
                    )
                ),
                takeUntil(this.destroy$)
            )
            .subscribe({
                next: (res) => {
                    this.autoSaving = false;
                    this.lastSavedAt = new Date(res.data.lastSavedAt);
                },
            });
    }

   

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

    
    private patchFormFromDraft(
        d:
            | SavedResumeResponse
            | {
                  personalInfo: ResumeData["personalInfo"];
                  summary: ResumeData["summary"];
                  experience: ResumeExperience[];
                  education: ResumeEducation[];
                  skills: ResumeSkill[];
              }
    ): void {
        // ── 1. Rebuild arrays silently (no valueChanges fired) ──

        // Experience
        this.experienceArray.clear({ emitEvent: false });
        d.experience.forEach((exp) => {
            this.experienceArray.push(
                this.fb.group({
                    jobTitle: [exp.jobTitle, Validators.required],
                    company: [exp.company, Validators.required],
                    startDate: [exp.startDate, Validators.required],
                    endDate: [exp.endDate || ""],
                    isCurrent: [exp.isCurrent],
                    description: [exp.description],
                    achievements: this.fb.array(
                        (exp.achievements ?? []).map((a) => this.fb.control(a))
                    ),
                }),
                { emitEvent: false }
            );
        });

        // Education
        this.educationArray.clear({ emitEvent: false });
        d.education.forEach((edu) => {
            this.educationArray.push(
                this.fb.group({
                    degree: [edu.degree, Validators.required],
                    institution: [edu.institution, Validators.required],
                    fieldOfStudy: [edu.fieldOfStudy, Validators.required],
                    startDate: [edu.startDate, Validators.required],
                    endDate: [edu.endDate || ""],
                    isCurrent: [edu.isCurrent],
                    grade: [edu.grade || ""],
                }),
                { emitEvent: false }
            );
        });

        // Skills
        this.skillsArray.clear({ emitEvent: false });
        d.skills.forEach((s) => {
            this.skillsArray.push(
                this.fb.group({
                    name: [s.name, Validators.required],
                    category: [""],
                }),
                { emitEvent: false }
            );
        });

        // ── 2. Patch simple fields — fires exactly ONE emission ──
        this.suppressAutoSaveCount = 1;
        this.resumeForm.patchValue({
            personalInfo: d.personalInfo,
            summary: d.summary,
        });
    }

    

    get experienceArray(): FormArray {
        return this.resumeForm.get("experience") as FormArray;
    }

    get educationArray(): FormArray {
        return this.resumeForm.get("education") as FormArray;
    }

    get skillsArray(): FormArray {
        return this.resumeForm.get("skills") as FormArray;
    }

    

    addExperience(): void {
        this.experienceArray.push(
            this.fb.group({
                jobTitle: ["", Validators.required],
                company: ["", Validators.required],
                startDate: ["", Validators.required],
                endDate: [""],
                isCurrent: [false],
                description: [""],
                achievements: this.fb.array([]),
            })
        );
    }

    removeExperience(index: number): void {
        this.experienceArray.removeAt(index);
    }

    getAchievements(expIndex: number): FormArray {
        return this.experienceArray
            .at(expIndex)
            .get("achievements") as FormArray;
    }

    addAchievement(expIndex: number): void {
        this.getAchievements(expIndex).push(
            this.fb.control("", Validators.required)
        );
    }

    removeAchievement(expIndex: number, achIndex: number): void {
        this.getAchievements(expIndex).removeAt(achIndex);
    }

  

    addEducation(): void {
        this.educationArray.push(
            this.fb.group({
                degree: ["", Validators.required],
                institution: ["", Validators.required],
                fieldOfStudy: ["", Validators.required],
                startDate: ["", Validators.required],
                endDate: [""],
                isCurrent: [false],
                grade: [""],
            })
        );
    }

    removeEducation(index: number): void {
        this.educationArray.removeAt(index);
    }

    

    addSkill(): void {
        this.skillsArray.push(
            this.fb.group({
                name: ["", Validators.required],
                category: [""],
            })
        );
    }

    removeSkill(index: number): void {
        this.skillsArray.removeAt(index);
    }

    

    onTemplateSelected(id: ResumeTemplateId): void {
        this.selectedTemplate = id;
        this.computePreview();

        // Template change should also trigger auto-save
        this.savetrigger$.next(this.buildResumeData());
    }

   

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

                    this.snackBar.open(
                        "Profile data loaded successfully",
                        "Close",
                        { duration: 3000 }
                    );
                },
                error: (err) => {
                    this.loadingProfile = false;
                    this.snackBar.open(
                        err.error?.message ?? "Failed to load profile data",
                        "Close",
                        { duration: 4000 }
                    );
                },
            });
    }

    generatePdf(): void {
        if (this.resumeForm.invalid) {
            this.resumeForm.markAllAsTouched();
            this.snackBar.open(
                "Please fill all required fields",
                "Close",
                { duration: 3000 }
            );
            return;
        }

        this.generatingPdf = true;
        const resumeData = this.buildResumeData();

        this.resumeService
            .generatePdf(resumeData)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (blob) => {
                    this.downloadBlob(
                        blob,
                        `${resumeData.personalInfo.fullName.replace(/\s+/g, "_")}_Resume.pdf`
                    );
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

  

    uploadResume(): void {
        if (this.resumeForm.invalid) {
            this.resumeForm.markAllAsTouched();
            this.snackBar.open(
                "Please fill all required fields",
                "Close",
                { duration: 3000 }
            );
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
                    this.snackBar.open(
                        "Resume uploaded to your profile!",
                        "Close",
                        { duration: 3000 }
                    );
                },
                error: (err) => {
                    this.uploading = false;
                    this.snackBar.open(
                        err.error?.message ?? "Upload failed",
                        "Close",
                        { duration: 4000 }
                    );
                },
            });
    }

   

    private buildResumeData(): ResumeData {
        const raw = this.resumeForm.getRawValue();
        return {
            ...raw,
            templateId: this.selectedTemplate,
            experience: raw.experience.map(
                (exp: Record<string, unknown> & { achievements: string[] }) => ({
                    ...exp,
                    achievements: exp.achievements ?? [],
                })
            ),
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