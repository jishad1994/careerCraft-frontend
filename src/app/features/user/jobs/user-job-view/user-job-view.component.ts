import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Job } from '../../../../models/job/job.model';
import {
  
  IResume,
  UserProfile,
} from '../../../../models/user/user-profile.model';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {  Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { UserJobService } from '../../../../services/user/job/user-job.service';
import { UserProfileService } from '../../../../services/user/profile/user-profile.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserJobApplicationService } from '../../../../services/user/application/user-job-application.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-job-view',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-job-view.component.html',
  styleUrl: './user-job-view.component.css',
})
export class UserJobViewComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private _jobApplicationService = inject(UserJobApplicationService);
  private _jobService = inject(UserJobService);
  private _profileService = inject(UserProfileService);
  private snackBar = inject(MatSnackBar);

  job: Job | null = null;
  loading = false;
  submitting = false;
  jobSlug = '';

  userProfile: UserProfile | null = null;
  userResumes: IResume[] = [];

  hasApplied = false;

  applicationForm!: FormGroup;
  showApplicationModal = false;

  // Cover letter options
  coverLetterType: 'text' | 'document' | 'none' = 'none';
  coverLetterFile: File | null = null;
  coverLetterFileName = '';

  // Resume upload
  uploadingResume = false;
  newResumeFile: File | null = null;

  destroy$ = new Subject<void>();

  constructor() {
    this.initForm();
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.jobSlug = params['slug'];
      if (this.jobSlug) {
        this.loadJob();
        this.loadUserProfile();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm() {
    this.applicationForm = this.fb.group({
      resumeOriginalName: ['', Validators.required],
      coverLetterText: [''],
      expectedSalary: [''],
      salaryCurrency: ['INR'],
      salaryPeriod: ['monthly'],
      availableFrom: [''],
      noticePeriod: [''],
      portfolioUrl: [''],
      linkedinUrl: [''],
      githubUrl: [''],
    });
  }

  loadJob() {
    this.loading = true;
    this._jobService
      .getJobBySlug(this.jobSlug)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.job = response.data;
          }
          this.checkApplicationStatus();
          this.loading = false;
        },
        error: (_error) => {
          this.snackBar.open('Failed to load job details', 'Close', {
            duration: 3000,
          });
          this.loading = false;
          this.router.navigate(['/jobs']);
        },
      });
  }

  

  loadUserProfile() {
    this._profileService
      .getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.userProfile = response.data;
            this.userResumes = response.data.resumeURL || [];

            // Pre-fill form with profile data
            if (this.userResumes.length > 0) {
              const primaryResume: IResume = this.userResumes[0];
              this.applicationForm.patchValue({
                resumeOriginalName: primaryResume.originalName,
              });
            }

            if (this.userProfile.portfolioUrl) {
              this.applicationForm.patchValue({
                portfolioUrl: this.userProfile.portfolioUrl,
              });
            }

            if (this.userProfile.linkedinUrl) {
              this.applicationForm.patchValue({
                linkedinUrl: this.userProfile.linkedinUrl,
              });
            }

            if (this.userProfile.githubUrl) {
              this.applicationForm.patchValue({
                githubUrl: this.userProfile.githubUrl,
              });
            }
          }
        },
        error: (error) => {
          console.error('Failed to load user profile', error);
        },
      });
  }

  checkApplicationStatus() {
    if (!this.job) {
      return;
    }
    this._jobApplicationService
      .checkApplicationStatus(this.job?._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.hasApplied = response.data?.hasApplied || false;
        },
        error: () => {
          this.hasApplied = false;
        },
      });
  }

  openApplicationModal() {
    if (this.hasApplied) {
      this.snackBar.open(
        'You have already applied for this position',
        'Close',
        {
          duration: 3000,
        }
      );
      return;
    }
    if (this.userResumes.length === 0) {
      this.snackBar.open('Please upload a resume first', 'Close', {
        duration: 3000,
      });
      return;
    }

    this.showApplicationModal = true;
  }

  closeApplicationModal() {
    this.showApplicationModal = false;
    this.coverLetterType = 'none';
    this.coverLetterFile = null;
    this.coverLetterFileName = '';
  }

  onCoverLetterTypeChange(type: 'text' | 'document' | 'none') {
    this.coverLetterType = type;
    this.coverLetterFile = null;
    this.coverLetterFileName = '';

    if (type !== 'text') {
      this.applicationForm.patchValue({ coverLetterText: '' });
    }
  }

  onCoverLetterFileSelect(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!allowedTypes.includes(file.type)) {
        this.snackBar.open('Please upload PDF or Word document', 'Close', {
          duration: 3000,
        });
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('File size should not exceed 5MB', 'Close', {
          duration: 3000,
        });
        return;
      }

      this.coverLetterFile = file;
      this.coverLetterFileName = file.name;
    }
  }

  onResumeFileSelect(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      // Validate file type (PDF only)
      if (file.type !== 'application/pdf') {
        this.snackBar.open('Please upload PDF file only', 'Close', {
          duration: 3000,
        });
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('File size should not exceed 5MB', 'Close', {
          duration: 3000,
        });
        return;
      }

      this.newResumeFile = file;
      this.uploadNewResume();
    }
  }

  uploadNewResume() {
    if (!this.newResumeFile) return;

    this.uploadingResume = true;

    this._profileService
      .uploadResume(this.newResumeFile)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Resume uploaded successfully', 'Close', {
            duration: 2000,
          });
          this.uploadingResume = false;
          this.newResumeFile = null;

          this.loadUserProfile();
        },
        error: () => {
          this.snackBar.open('Failed to upload resume', 'Close', {
            duration: 3000,
          });
          this.uploadingResume = false;
        },
      });
  }

  get resumeUrl() {
    return this.applicationForm.get('resumeId')?.value;
  }

  submitApplication() {
    if (this.applicationForm.invalid) {
      this.applicationForm.markAllAsTouched();
      this.snackBar.open('Please fill all required fields', 'Close', {
        duration: 3000,
      });
      return;
    }

    if (this.coverLetterType === 'document' && !this.coverLetterFile) {
      this.snackBar.open('Please upload cover letter document', 'Close', {
        duration: 3000,
      });
      return;
    }

    this.submitting = true;

    const formData = new FormData();

    // Add form fields
    formData.append('job', this.job!._id);
    formData.append('company', this.job!.company._id);

    const selectedResume = this.userResumes.find(
      (resume) =>
        resume.originalName === this.applicationForm.value.resumeOriginalName
    );

    if (!selectedResume) {
      this.snackBar.open('Please select a resume', 'Close', { duration: 3000 });
      this.submitting = false;
      return;
    }

    formData.append('resumeFileName', selectedResume.originalName);
    formData.append('resumeFilekey', selectedResume.key);

    // Cover letter
    if (
      this.coverLetterType === 'text' &&
      this.applicationForm.value.coverLetterText
    ) {
      formData.append('coverLetterType', 'text');
      formData.append(
        'coverLetterText',
        this.applicationForm.value.coverLetterText
      );
    } else if (this.coverLetterType === 'document' && this.coverLetterFile) {
      formData.append('coverLetterType', 'document');
      formData.append('coverLetter', this.coverLetterFile);
    }

    // Additional fields
    if (this.applicationForm.value.expectedSalary) {
      formData.append(
        'expectedSalary',
        this.applicationForm.value.expectedSalary
      );
      formData.append(
        'salaryCurrency',
        this.applicationForm.value.salaryCurrency
      );
      formData.append('salaryPeriod', this.applicationForm.value.salaryPeriod);
    }

    if (this.applicationForm.value.availableFrom) {
      formData.append(
        'availableFrom',
        this.applicationForm.value.availableFrom
      );
    }

    if (this.applicationForm.value.noticePeriod) {
      formData.append('noticePeriod', this.applicationForm.value.noticePeriod);
    }

    if (this.applicationForm.value.portfolioUrl) {
      formData.append('portfolioUrl', this.applicationForm.value.portfolioUrl);
    }

    if (this.applicationForm.value.linkedinUrl) {
      formData.append('linkedinUrl', this.applicationForm.value.linkedinUrl);
    }

    if (this.applicationForm.value.githubUrl) {
      formData.append('githubUrl', this.applicationForm.value.githubUrl);
    }

    this._jobService
      .applyForJob(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Application submitted successfully!', 'Close', {
            duration: 3000,
          });
          this.submitting = false;
          this.hasApplied = true;
          this.closeApplicationModal();
        },
        error: (error) => {
          this.snackBar.open(
            error.error?.message || 'Failed to submit application',
            'Close',
            { duration: 3000 }
          );
          this.submitting = false;
        },
      });
  }

  goBack() {
    this.router.navigate(['user/jobs']);
  }

  formatSalary(): string {
    if (!this.job?.salary || this.job.salary.isHidden) {
      return 'Not disclosed';
    }
    const { min, max, currency, period } = this.job.salary;
    if (min && max) {
      return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()} / ${period}`;
    }
    return 'Not disclosed';
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const posted = new Date(date);
    const days = Math.floor(
      (now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  }
}
