import { Component, OnInit, OnDestroy, inject } from "@angular/core";
import { Education, Experience, IDocuments, UserProfile } from "../../../models/user/user-profile.model";
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Subject, takeUntil } from "rxjs";
import { PdfViewerComponent } from "../pdf-viewer/pdf-viewer.component";
import { ResumeService } from "../../services/resume-service/resume.service";
import { CandidateService } from "../../../services/company/candidate-service/candidate.service";
import { CommonModule } from "@angular/common";

@Component({
    selector: "app-candidate-profile",
    imports: [CommonModule],
    templateUrl: "./candidate-profile.component.html",
    styleUrl: "./candidate-profile.component.css",
})
export class CandidateProfileComponent implements OnInit, OnDestroy {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly _resumeService = inject(ResumeService);
    private readonly _candidateService = inject(CandidateService);
    private readonly dialog = inject(MatDialog);
    private readonly snackBar = inject(MatSnackBar);

    profile: UserProfile | null = null;
    loading = true;
    previousPageUrl = "/";

    private readonly destroy$ = new Subject<void>();

    ngOnInit(): void {
        const userId = this.route.snapshot.paramMap.get("userId");
        if (userId) {
            this.loadProfile(userId);
        } else {
            this.router.navigate(["/"]);
        }

        const state = history.state as { returnUrl?: string };

        console.log("return url", state?.returnUrl);
        if (state?.returnUrl) {
            this.previousPageUrl = state.returnUrl;
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadProfile(userId: string): void {
        this.loading = true;
        this._candidateService
            .getCandiateProfile(userId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.success && response.data) {
                        this.profile = response.data;
                    } else {
                        this.snackBar.open("Failed to load profile", "Close", {
                            duration: 3000,
                        });
                        this.router.navigate(["/"]);
                    }
                    this.loading = false;
                },
                error: () => {
                    this.snackBar.open("Error loading profile", "Close", {
                        duration: 3000,
                    });
                    this.loading = false;
                    this.router.navigate(["/"]);
                },
            });
    }

    viewResume(resume: IDocuments): void {
        if (!this.profile) return;

        this._resumeService
            .getResumeByCandidateId(this.profile.id, resume.key)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (blob) => {
                    this.dialog.open(PdfViewerComponent, {
                        width: "90vw",
                        maxWidth: "1200px",
                        height: "90vh",
                        data: {
                            blob,
                            fileName: resume.originalName,
                            candidateName: `${this.profile?.firstName} ${this.profile?.lastName}`,
                        },
                    });
                },
                error: () => {
                    this.snackBar.open("Failed to load resume", "Close", {
                        duration: 3000,
                    });
                },
            });
    }

    downloadResume(resume: IDocuments): void {
        if (!this.profile) return;

        this._resumeService
            .getResumeByCandidateId(this.profile.id, resume.key)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (blob) => {
                    const url = URL.createObjectURL(blob);

                    const a = document.createElement("a");
                    a.href = url;

                    const fileName = `${this.profile?.firstName || "resume"}-${Date.now()}.pdf`;
                    a.download = fileName;

                    document.body.appendChild(a);

                    a.click();

                    document.body.removeChild(a);

                    setTimeout(() => URL.revokeObjectURL(url), 1000);

                    this.snackBar.open("Downloading resume...", "Close", {
                        duration: 2000,
                    });
                },
                error: () => {
                    this.snackBar.open("Failed to download resume", "Close", {
                        duration: 3000,
                    });
                },
            });
    }

    getExperienceDuration(experience: Experience): string {
        const start = new Date(experience.startDate);
        const end = experience.isCurrent ? new Date() : new Date(experience.endDate!);

        const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;

        if (years > 0 && remainingMonths > 0) {
            return `${years} yr ${remainingMonths} mo`;
        } else if (years > 0) {
            return `${years} yr`;
        } else {
            return `${remainingMonths} mo`;
        }
    }

    getEducationDuration(education: Education): string {
        const start = new Date(education.startDate);
        if (education.isCurrent) {
            return `${start.getFullYear()} - Present`;
        }
        if (education.endDate) {
            const end = new Date(education.endDate);
            return `${start.getFullYear()} - ${end.getFullYear()}`;
        }
        return `${start.getFullYear()}`;
    }

    formatDate(date: string): string {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
        });
    }

    goBack(): void {
        this.router.navigate([this.previousPageUrl]);
    }
}
