import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CreateJobDto, Job } from '../../../../models/job/job.model';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyJobService } from '../../../../services/company/job/company-job.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Skill } from '../../../../models/skill.model';
import {  Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-job',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-job.component.html',
  styleUrl: './edit-job.component.css',
})
export class EditJobComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private _jobService = inject(CompanyJobService);
  private snackBar = inject(MatSnackBar);

  jobForm!: FormGroup;
  loading = false;
  submitting = false;
  jobId = '';
  originalJob: Job | null = null;


  skillSearch = '';
  skillSearchResults: Skill[] = [];
  selectedSkills: Skill[] = [];
  destroy$ = new Subject<void>();

  employmentTypes = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
    { value: 'freelance', label: 'Freelance' },
  ];

  workModes = [
    { value: 'remote', label: 'Remote' },
    { value: 'onsite', label: 'On-site' },
    { value: 'hybrid', label: 'Hybrid' },
  ];

  currencies = [
    { value: 'AED', label: 'AED' },
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'GBP', label: 'GBP' },
    { value: 'INR', label: 'INR' },
  ];

  salaryPeriods = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  constructor() {
    this.initForm();
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.jobId = params['id'];
      if (this.jobId) {
        this.loadJob();
      } else {
        this.snackBar.open('Invalid job ID', 'Close', { duration: 3000 });
        this.router.navigate(['/company/dashboard/jobs']);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm() {
    this.jobForm = this.fb.group({
      title: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(150),
        ],
      ],
      description: ['', [Validators.required, Validators.minLength(50)]],
      employmentType: ['full-time', Validators.required],
      workMode: ['remote', Validators.required],

      location: this.fb.group({
        country: ['', Validators.required],
        state: [''],
        city: ['', Validators.required],
      }),

      experience: this.fb.group({
        min: [0, [Validators.required, Validators.min(0)]],
        max: [null, Validators.min(0)],
      }),

      salary: this.fb.group({
        min: [null, Validators.min(0)],
        max: [null, Validators.min(0)],
        currency: ['AED'],
        period: ['monthly'],
        isHidden: [false],
      }),

      openings: [1, [Validators.required, Validators.min(1)]],
      expiresAt: [''],

      requirements: this.fb.array([this.fb.control('')]),
      responsibilities: this.fb.array([this.fb.control('')]),
    });
  }

  loadJob() {
    this.loading = true;
    this._jobService.getJobById(this.jobId).subscribe({
      next: (response) => {
        if (response.data) {
          this.originalJob = response.data;

          if (response.data.status !== 'draft') {
            this.snackBar.open('Only draft jobs can be edited', 'Close', {
              duration: 3000,
            });
            this.router.navigate(['/company/dashboard/jobs', this.jobId]);
            return;
          }

          this.populateForm(response.data);
        }
        this.loading = false;
      },
      error: (_error) => {
        this.snackBar.open('Failed to load job details', 'Close', {
          duration: 3000,
        });
        this.loading = false;
        this.router.navigate(['/company/dashboard/jobs']);
      },
    });
  }

  populateForm(job: Job) {
    this.jobForm.patchValue({
      title: job.title,
      description: job.description,
      employmentType: job.employmentType,
      workMode: job.workMode,
      location: {
        country: job.location.country,
        state: job.location.state || '',
        city: job.location.city,
      },
      experience: {
        min: job.experience?.min || 0,
        max: job.experience?.max || null,
      },
      salary: {
        min: job.salary?.min || null,
        max: job.salary?.max || null,
        currency: job.salary?.currency || 'AED',
        period: job.salary?.period || 'monthly',
        isHidden: job.salary?.isHidden || false,
      },
      openings: job.openings,
      expiresAt: job.expiresAt ? this.formatDateForInput(job.expiresAt) : '',
    });

    this.requirements.clear();
    this.responsibilities.clear();

    if (job.requirements && job.requirements.length > 0) {
      job.requirements.forEach((req) =>
        this.requirements.push(this.fb.control(req))
      );
    } else {
      this.requirements.push(this.fb.control(''));
    }

    if (job.responsibilities && job.responsibilities.length > 0) {
      job.responsibilities.forEach((resp) =>
        this.responsibilities.push(this.fb.control(resp))
      );
    } else {
      this.responsibilities.push(this.fb.control(''));
    }

    if (job.skills && job.skills.length > 0) {
      this.selectedSkills = job.skills.map((skill: Skill) => ({
        _id: typeof skill === 'object' ? skill._id : skill,
        name: typeof skill === 'object' ? skill.name : skill,
      }));
    }
  }

  formatDateForInput(date: Date | string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  get requirements(): FormArray {
    return this.jobForm.get('requirements') as FormArray;
  }

  addRequirement() {
    this.requirements.push(this.fb.control(''));
  }

  removeRequirement(index: number) {
    if (this.requirements.length > 1) {
      this.requirements.removeAt(index);
    }
  }

  get responsibilities(): FormArray {
    return this.jobForm.get('responsibilities') as FormArray;
  }

  addResponsibility() {
    this.responsibilities.push(this.fb.control(''));
  }

  removeResponsibility(index: number) {
    if (this.responsibilities.length > 1) {
      this.responsibilities.removeAt(index);
    }
  }

  searchSkills() {
    if (this.skillSearch.length < 2) {
      this.skillSearchResults = [];
      return;
    }

    this._jobService
      .searchSkills(this.skillSearch)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.skillSearchResults = response.data.filter(
            (skill: Skill) =>
              !this.selectedSkills.find((s) => s._id === skill._id)
          );
        },
        error: () => {
          this.skillSearchResults = [];
        },
      });
  }

  addSkill(skill: Skill) {
    this.selectedSkills.push(skill);
    this.skillSearch = '';
    this.skillSearchResults = [];
  }

  
  removeSkill(skill: Skill) {
    this.selectedSkills = this.selectedSkills.filter(
      (s) => s._id !== skill._id
    );
  }

  onSubmit() {
    if (this.jobForm.invalid) {
      this.jobForm.markAllAsTouched();
      this.snackBar.open('Please fill all required fields correctly', 'Close', {
        duration: 3000,
      });
      return;
    }

    this.submitting = true;
    const formValue = this.jobForm.value;

    // Filter out empty requirements and responsibilities
    const requirementsArray = formValue.requirements.filter(
      (r: string) => r && r.trim()
    );
    const responsibilitiesArray = formValue.responsibilities.filter(
      (r: string) => r && r.trim()
    );

    const jobData: CreateJobDto = {
      title: formValue.title,
      description: formValue.description,
      employmentType: formValue.employmentType,
      workMode: formValue.workMode,
      location: {
        country: formValue.location.country,
        state: formValue.location.state || undefined,
        city: formValue.location.city,
      },
      experience: {
        min: formValue.experience.min,
        max: formValue.experience.max || undefined,
      },
      salary: {
        min: formValue.salary.min || undefined,
        max: formValue.salary.max || undefined,
        currency: formValue.salary.currency,
        period: formValue.salary.period,
        isHidden: formValue.salary.isHidden,
      },
      openings: formValue.openings,
      expiresAt: formValue.expiresAt
        ? new Date(formValue.expiresAt)
        : undefined,
      requirements: requirementsArray,
      responsibilities: responsibilitiesArray,
      skills: this.selectedSkills.map((s) => s._id) ,
    };

    this.updateJob(jobData);
  }

  updateJob(jobData: CreateJobDto) {
    this._jobService.updateJob(this.jobId, jobData).subscribe({
      next: (_response) => {
        this.snackBar.open('Job updated successfully', 'Close', {
          duration: 2000,
        });
        this.submitting = false;
        this.router.navigate(['/company/dashboard/jobs', this.jobId]);
      },
      error: (error) => {
        this.snackBar.open(
          error.error?.message || 'Failed to update job',
          'Close',
          {
            duration: 3000,
          }
        );
        this.submitting = false;
      },
    });
  }

  onCancel() {
    this.router.navigate(['/company/dashboard/jobs', this.jobId]);
  }

  goBack() {
    if (this.jobForm.dirty || this.hasSkillsChanged()) {
      if (
        confirm('You have unsaved changes. Are you sure you want to leave?')
      ) {
        this.onCancel();
      }
    } else {
      this.onCancel();
    }
  }

  hasSkillsChanged(): boolean {
    if (!this.originalJob || !this.originalJob.skills)
      return this.selectedSkills.length > 0;

    const originalSkillIds = this.originalJob.skills
      .map((s: Skill) => (typeof s === 'string' ? s : s._id))
      .sort();

    const currentSkillIds = this.selectedSkills.map((s) => s._id).sort();

    return JSON.stringify(originalSkillIds) !== JSON.stringify(currentSkillIds);
  }

  // Helper methods for form validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.jobForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.jobForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'This field is required';
      if (field.errors['minlength'])
        return `Minimum ${field.errors['minlength'].requiredLength} characters required`;
      if (field.errors['maxlength'])
        return `Maximum ${field.errors['maxlength'].requiredLength} characters allowed`;
      if (field.errors['min'])
        return `Minimum value is ${field.errors['min'].min}`;
    }
    return '';
  }
}
