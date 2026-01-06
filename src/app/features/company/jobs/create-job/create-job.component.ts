import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompanyJobService } from '../../../../services/company/job/company-job.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-job',
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './create-job.component.html',
  styleUrl: './create-job.component.css'
})
export class CreateJobComponent implements OnInit {
jobForm!: FormGroup;
  submitting = false;
  skillSearch = '';
  skillSearchResults: any[] = [];
  selectedSkills: any[] = [];

  constructor(
    private _fb: FormBuilder,
    private _jobService: CompanyJobService,
    private _router: Router,
    private _snackBar: MatSnackBar,
    private _http: HttpClient
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.jobForm = this._fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      employmentType: ['', Validators.required],
      workMode: ['', Validators.required],
      openings: [1, [Validators.required, Validators.min(1)]],
      location: this._fb.group({
        country: ['', Validators.required],
        state: [''],
        city: ['', Validators.required],
      }),
      experience: this._fb.group({
        min: [0, [Validators.required, Validators.min(0)]],
        max: [null],
      }),
      salary: this._fb.group({
        min: [null],
        max: [null],
        currency: ['INR'],
        period: ['monthly'],
        isHidden: [false],
      }),
      responsibilities: this._fb.array([this._fb.control('')]),
      requirements: this._fb.array([this._fb.control('')]),
    });
  }

  get responsibilities() {
    return this.jobForm.get('responsibilities') as FormArray;
  }

  get requirements() {
    return this.jobForm.get('requirements') as FormArray;
  }

  addResponsibility() {
    this.responsibilities.push(this._fb.control(''));
  }

  removeResponsibility(index: number) {
    if (this.responsibilities.length > 1) {
      this.responsibilities.removeAt(index);
    }
  }

  addRequirement() {
    this.requirements.push(this._fb.control(''));
  }

  removeRequirement(index: number) {
    if (this.requirements.length > 1) {
      this.requirements.removeAt(index);
    }
  }

  searchSkills() {
    if (this.skillSearch.length < 2) {
      this.skillSearchResults = [];
      return;
    }

    this._http.get<any>(`http://localhost:3000/api/skills/search?q=${this.skillSearch}`)
      .subscribe({
        next: (response) => {
          this.skillSearchResults = response.data.filter(
            (skill: any) => !this.selectedSkills.find(s => s._id === skill._id)
          );
        },
        error: () => {
          this.skillSearchResults = [];
        }
      });
  }

  addSkill(skill: any) {
    this.selectedSkills.push(skill);
    this.skillSearch = '';
    this.skillSearchResults = [];
  }

  removeSkill(skill: any) {
    this.selectedSkills = this.selectedSkills.filter(s => s._id !== skill._id);
  }

  onSubmit() {
    if (this.jobForm.invalid) {
      this.jobForm.markAllAsTouched();
      this._snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.createJob('active');
  }

  saveDraft() {
    if (!this.jobForm.get('title')?.value) {
      this._snackBar.open('Job title is required', 'Close', { duration: 3000 });
      return;
    }

    this.createJob('draft');
  }

  private createJob(status: string) {
    this.submitting = true;

    const formValue = this.jobForm.value;
    const jobData = {
      ...formValue,
      responsibilities: formValue.responsibilities.filter((r: string) => r.trim()),
      requirements: formValue.requirements.filter((r: string) => r.trim()),
      skills: this.selectedSkills.map(s => s._id),
      status,
    };

    this._jobService.createJob(jobData).subscribe({
      next: (response) => {
        this._snackBar.open(
          status === 'draft' ? 'Job saved as draft' : 'Job posted successfully',
          'Close',
          { duration: 2000 }
        );
        this._router.navigate(['/company/dashboard/jobs']);
      },
      error: (error) => {
        this.submitting = false;
        this._snackBar.open(
          error.error?.message || 'Failed to create job',
          'Close',
          { duration: 3000 }
        );
      }
    });
  }

  goBack() {
    this._router.navigate(['/company/dashboard/jobs']);
  }
}
