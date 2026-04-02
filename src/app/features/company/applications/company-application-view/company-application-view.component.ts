import { Component, OnDestroy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatDialog } from "@angular/material/dialog";
import {
    IJobApplicationDetails,
    ApplicationStatus,
    IInterview,
} from "../../../../models/job-application/job-application.model";
import { CompanyApplicationService } from "../../../../services/company/applications/company-application.service";
import { PdfViewerComponent } from "../../../../shared/components/pdf-viewer/pdf-viewer.component";
import { ResumeService } from "../../../../shared/services/resume-service/resume.service";
import { InterviewService } from "../../../../services/company/interview-service/interview.service";
import { ChatInitiationService } from "../../../../shared/services/chat-inititaion-service/chat-initiation.service";

@Component({
    selector: "app-company-application-view",
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: "./company-application-view.component.html",
    styleUrl: "./company-application-view.component.css",
})
export class CompanyApplicationViewComponent implements OnInit, OnDestroy {
    application: IJobApplicationDetails | null = null;
    loading = false;
    applicationId: string = "";

    today: string = new Date().toISOString().split("T")[0];

    previousPageUrl: string = "";

    // Modals
    showStatusModal = false;
    showNotesModal = false;
    showInterviewModal = false;

    // Status
    newStatus: ApplicationStatus = "pending";
    statusNotes = "";

    // Notes
    notes = "";

    // Interview
    interviewData: Partial<IInterview> = {
        round: 1,
        type: "phone",
        status: "scheduled",
    };
    scheduledDate = "";
    scheduledTime = "";

    statusOptions = [
        { value: "pending", label: "Pending", color: "yellow" },
        { value: "reviewing", label: "Reviewing", color: "blue" },
        { value: "shortlisted", label: "Shortlisted", color: "purple" },
        { value: "interviewed", label: "Interviewed", color: "indigo" },
        { value: "offered", label: "Offered", color: "green" },
        { value: "rejected", label: "Rejected", color: "red" },
        { value: "withdrawn", label: "Withdrawn", color: "gray" },
        { value: "hired", label: "Hired", color: "emerald" },
    ];

    interviewTypes = [
        { value: "phone", label: "Phone Interview" },
        { value: "video", label: "Video Interview" },
        { value: "in-person", label: "In-Person Interview" },
        { value: "technical", label: "Technical Interview" },
        { value: "hr", label: "HR Interview" },
    ];

    private readonly destroy$ = new Subject<void>();

    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly applicationService: CompanyApplicationService,
        private readonly _interviewService: InterviewService,
        private readonly snackBar: MatSnackBar,
        private readonly dialog: MatDialog,
        private readonly _resumeService: ResumeService,
        private readonly chatInitiationService: ChatInitiationService,
    ) {}

    ngOnInit(): void {
        this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
            this.applicationId = params["id"];
            if (this.applicationId) {
                this.loadApplication();
            }
        });

        this.previousPageUrl = history.state?.returnUrl;

        console.log("return url", history.state.returnUrl);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadApplication(): void {
        this.loading = true;
        console.log("application id from:", this.applicationId);
        this.applicationService
            .getApplicationById(this.applicationId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.success && response.data) {
                        this.application = response.data as IJobApplicationDetails;

                        if (!this.application.viewedAt) {
                            this.markAsViewed();
                        }
                    }
                    this.loading = false;
                },
                error: () => {
                    this.snackBar.open("Failed to load application", "Close", {
                        duration: 3000,
                    });
                    this.loading = false;
                    this.router.navigate(["/company/dashboard/applications"]);
                },
            });
    }

    markAsViewed(): void {
        this.applicationService
            .markAsViewed(this.applicationId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    if (this.application) {
                        this.application.viewedAt = new Date();
                    }
                },
            });
    }

    viewProfile(): void {
        if (this.application) {
            this.router.navigate(["company/dashboard/candidates", this.application.applicantDetails._id], {
                state: {
                    returnUrl: `company/dashboard/applications/${this.application._id}`,
                },
            });
        }
    }

    viewResume(): void {
        if (!this.application?.resume) return;

        // Stream resume from backend
        this._resumeService
            .getUserResumeByApplicationId(this.applicationId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (blob) => {
                    this.dialog.open(PdfViewerComponent, {
                        width: "90vw",
                        maxWidth: "1200px",
                        height: "90vh",
                        data: {
                            blob,
                            fileName: this.application!.resume.fileName,
                            candidateName: this.getCandidateName(),
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

    downloadResume(): void {
        if (!this.application?.resume) return;

        this._resumeService
            .getUserResumeByApplicationId(this.applicationId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (blob) => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = this.application!.resume.fileName;
                    a.click();
                    URL.revokeObjectURL(url);
                    this.snackBar.open("Resume downloaded", "Close", { duration: 2000 });
                },
                error: () => {
                    this.snackBar.open("Download failed", "Close", { duration: 3000 });
                },
            });
    }

    // Status Modal
    openStatusModal(): void {
        if (!this.application) return;
        this.newStatus = this.application.status;
        this.statusNotes = "";
        this.showStatusModal = true;
    }

    closeStatusModal(): void {
        this.showStatusModal = false;
        this.newStatus = "pending";
        this.statusNotes = "";
    }

    submitStatusChange(): void {
        this.applicationService
            .updateApplicationStatus(this.applicationId, this.newStatus, this.statusNotes)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.snackBar.open("Status updated successfully", "Close", {
                        duration: 2000,
                    });
                    this.loadApplication();
                    this.closeStatusModal();
                },
                error: () => {
                    this.snackBar.open("Failed to update status", "Close", {
                        duration: 3000,
                    });
                },
            });
    }

    // Notes Modal
    openNotesModal(): void {
        if (!this.application) return;
        this.notes = this.application.notes || "";
        this.showNotesModal = true;
    }

    closeNotesModal(): void {
        this.showNotesModal = false;
        this.notes = "";
    }

    submitNotes(): void {
        this.applicationService
            .addNotes(this.applicationId, this.notes)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.snackBar.open("Notes saved successfully", "Close", {
                        duration: 2000,
                    });
                    this.application = response.data as IJobApplicationDetails;
                    this.closeNotesModal();
                },
                error: () => {
                    this.snackBar.open("Failed to save notes", "Close", {
                        duration: 3000,
                    });
                },
            });
    }

    // Interview Modal
    openInterviewModal(): void {
        if (!this.application) return;

        const lastRound = this.application.interviews?.length || 0;
        this.interviewData = {
            round: lastRound + 1,
            type: "phone",
            status: "scheduled",
        };
        this.scheduledDate = "";
        this.scheduledTime = "";
        this.showInterviewModal = true;
    }

    closeInterviewModal(): void {
        this.showInterviewModal = false;
        this.interviewData = { round: 1, type: "phone", status: "scheduled" };
        this.scheduledDate = "";
        this.scheduledTime = "";
    }

    submitInterview(): void {
        if (!this.scheduledDate || !this.scheduledTime) {
            this.snackBar.open("Please select date and time", "Close", {
                duration: 3000,
            });
            return;
        }

        // Combine date and time
        const scheduledAt = new Date(`${this.scheduledDate}T${this.scheduledTime}`);

        const interviewPayload = {
            ...this.interviewData,
            scheduledAt: scheduledAt,
        };

        this._interviewService
            .scheduleInterview(this.applicationId, interviewPayload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.snackBar.open("Interview scheduled successfully", "Close", {
                        duration: 2000,
                    });
                    this.loadApplication();
                    this.closeInterviewModal();
                },
                error: () => {
                    this.snackBar.open("Failed to schedule interview", "Close", {
                        duration: 3000,
                    });
                },
            });
    }

    joinVideoInterview(interview: IInterview): void {
        this.router.navigate(["/company/dashboard/interviews", interview._id]);
    }

    // Helper Methods
    getCandidateName(): string {
        if (!this.application) return "";
        const { firstName, lastName } = this.application.applicantDetails;
        return `${firstName} ${lastName}`.trim() || "Unknown";
    }

    getCandidateInitials(): string {
        const name = this.getCandidateName();
        const parts = name.split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    getStatusClass(status: string): string {
        const classes: Record<string, string> = {
            pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
            reviewing: "bg-blue-100 text-blue-800 border-blue-300",
            shortlisted: "bg-purple-100 text-purple-800 border-purple-300",
            interviewed: "bg-indigo-100 text-indigo-800 border-indigo-300",
            offered: "bg-green-100 text-green-800 border-green-300",
            rejected: "bg-red-100 text-red-800 border-red-300",
            withdrawn: "bg-gray-100 text-gray-800 border-gray-300",
            hired: "bg-emerald-100 text-emerald-800 border-emerald-300",
        };
        return classes[status] || "bg-gray-100 text-gray-800 border-gray-300";
    }

    formatDate(date: Date | string): string {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    formatShortDate(date: Date | string): string {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }

    goBack(): void {
        this.router.navigate([this.previousPageUrl]);
    }

    isInterviewUpcoming(interview: IInterview): boolean {
        if (!interview.scheduledAt) return false;
        return new Date(interview.scheduledAt) > new Date() && interview.status === "scheduled";
    }

    canJoinInterview(interview: IInterview): boolean {
        if (!interview.scheduledAt || interview.type !== "video") return false;

        const scheduledTime = new Date(interview.scheduledAt).getTime();
        const now = Date.now();
        const fifteenMinutes = 15 * 60 * 1000;

        // Can join 15 minutes before scheduled time
        return now >= scheduledTime - fifteenMinutes && interview.status === "scheduled";
    }

    messageApplicant(application: IJobApplicationDetails): void {
        if (application.status !== "shortlisted") {
            // Optional: Show message that chat is only available for shortlisted
            return;
        }

        this.chatInitiationService.initiateFromApplication(
            application.applicantDetails._id,
            application.jobDetails._id,
            application._id,
        );
    }
}
