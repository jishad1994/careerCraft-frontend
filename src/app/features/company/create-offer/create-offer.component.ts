import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Subject, takeUntil, debounceTime, distinctUntilChanged, catchError, of } from "rxjs";
import { CompanyOfferLetterService } from "../../../shared/services/offerLetter-service/company/company-offer-letter.service";

import { ActivatedRoute, Router } from "@angular/router";
import { CreateOfferDto } from "../../../models/offerLetter.model";
import { IJobApplicationDetails } from "../../../models/job-application/job-application.model";
import { CommonModule } from "@angular/common";
import { CompanyApplicationService } from "../../../services/company/applications/company-application.service";

@Component({
    selector: "app-create-offer",
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: "./create-offer.component.html",
    styleUrl: "./create-offer.component.css",
})
export class CreateOfferComponent implements OnInit, OnDestroy {
    offerForm: FormGroup;
    submitting = false;
    isFetchingApplication = false;
    applicationId = "";

    today = new Date().toISOString().split("T")[0];

    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private offerService: CompanyOfferLetterService,
        private applicationService: CompanyApplicationService,
        private snackBar: MatSnackBar,
    ) {
        this.applicationId = this.route.snapshot.queryParams["applicationId"] ?? "";

        this.offerForm = this.fb.group({
            applicationId: [this.applicationId, Validators.required],
            designation: ["", Validators.required],
            department: ["", Validators.required],
            joiningDate: ["", Validators.required],
            expiresAt: ["", Validators.required],
            workLocation: ["", Validators.required],
            workMode: ["onsite", Validators.required],
            employmentType: ["full-time", Validators.required],
            compensation: this.fb.group({
                baseSalary: [0, [Validators.required, Validators.min(1)]],
                currency: ["INR"],
                period: ["yearly"],
                bonus: [""],
                otherBenefits: [""],
            }),
            probationPeriod: [null],
            additionalTerms: [""],
        });
    }

    ngOnInit(): void {
        if (this.applicationId) {
            this.fetchAndPopulate(this.applicationId);
        }

        this.offerForm
            .get("applicationId")!
            .valueChanges.pipe(debounceTime(600), distinctUntilChanged(), takeUntil(this.destroy$))
            .subscribe((id: string) => {
                if (id?.trim().length > 0) {
                    this.fetchAndPopulate(id.trim());
                }
            });
    }

    private fetchAndPopulate(applicationId: string): void {
        this.isFetchingApplication = true;

        this.applicationService
            .getApplicationById(applicationId)
            .pipe(
                catchError((err) => {
                    this.isFetchingApplication = false;
                    const msg =
                        err.status === 404
                            ? "Application not found. Please check the ID."
                            : "Failed to fetch application data.";
                    this.snackBar.open(msg, "Close", { duration: 3000 });
                    return of(null);
                }),
                takeUntil(this.destroy$),
            )
            .subscribe((res) => {
                this.isFetchingApplication = false;
                if (!res) return;

                const app: IJobApplicationDetails = res.data;
              

                this.offerForm.patchValue({
                    designation: app.jobDetails?.title ?? "",
                    // workLocation: app.jobDetails?.location ?? "",
                    workMode: app.jobDetails?.workMode ?? "onsite",
                    employmentType: app.jobDetails?.employmentType ?? "full-time",

                    compensation: {
                        baseSalary: app.expectedSalary?.amount ?? 0,
                        currency: app.expectedSalary?.currency ?? "INR",
                        period: app.expectedSalary?.period ?? "yearly",
                    },
                });

                this.snackBar.open(`Application loaded for ${app.candidateName}`, "Close", { duration: 2500 });
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onSubmit(): void {
        if (this.offerForm.invalid) {
            this.offerForm.markAllAsTouched();
            this.snackBar.open("Please fill all required fields", "Close", { duration: 3000 });
            return;
        }

        this.submitting = true;
        const dto: CreateOfferDto = this.offerForm.getRawValue();

        this.offerService
            .createOffer(dto)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.submitting = false;
                    this.snackBar.open("Offer letter sent successfully!", "Close", { duration: 3000 });
                    this.router.navigate(["/company/dashboard/offers", res.data._id]);
                },
                error: (err) => {
                    this.submitting = false;
                    this.snackBar.open(err.error?.message ?? "Failed to create offer", "Close", { duration: 4000 });
                },
            });
    }

    goBack(): void {
        this.router.navigate(["/company/dashboard/offers"]);
    }

    hasError(path: string): boolean {
        const control = this.offerForm.get(path);
        return !!control && control.invalid && control.touched;
    }
}
