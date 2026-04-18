import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { SubscriptionPlanService } from '../../../../services/admin/subscription-plan/subscription-plan.service';
import { Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ISubscriptionPlan } from '../../../../models/subscription-plan/subscription-plan.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-subscription-plan-form',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './subscription-plan-form.component.html',
  styleUrl: './subscription-plan-form.component.css',
})
export class SubscriptionPlanFormComponent implements OnInit, OnDestroy {
  private _planService = inject(SubscriptionPlanService);
  private _fb = inject(FormBuilder);
  private _snackBar = inject(MatSnackBar);

  planForm!: FormGroup;
  plans: ISubscriptionPlan[] = [];
  isEditing = false;
  editingId: string | null = null;
  showForm = false;
  loading = false;
  success = '';
  error = '';

  destroy$ = new Subject<void>();
  ngOnInit(): void {
    this.initForm();
    this.loadPlans();
  }

  initForm(): void {
    this.planForm = this._fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      price: [0, [Validators.required, Validators.min(0)]],
      durationInDays: [30, [Validators.required, Validators.min(1)]],
      description: [''],
      limits: this._fb.group({
        jobs: [0, [Validators.required, Validators.min(0)]],
        resumeViews: [0, [Validators.required, Validators.min(0)]],
        featuredJobs: [0, [Validators.required, Validators.min(0)]],
      }),
      features: this._fb.group({
        chat: [false],
        videoCall: [false],
        analytics: [false],
      }),
      isActive: [true],
    });
  }

  loadPlans(): void {
    this.loading = true;
    this._planService
      .getPlans()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.plans = response.data;
          this.loading = false;
        },
        error: (err) => {
          this._snackBar.open('Failed to load plans', 'close', {
            duration: 3000,
          });
          this.loading = false;
        },
      });
  }

  onSubmit(): void {
    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const planData = this.planForm.value;
    const request =
      this.isEditing && this.editingId
        ? this._planService.updatePlan(this.editingId, planData)
        : this._planService.createPlan(planData);

    request.subscribe({
      next: () => {
        this._snackBar.open(
          `Plan ${this.isEditing ? 'updadted' : 'created'} successfully`,
          'close',
          { duration: 3000 },
        );
        this.success = `Plan ${this.isEditing ? 'updated' : 'created'} successfully`;
        this.loadPlans();
        this.resetForm();
        this.loading = false;
        // setTimeout(() => (this.success = ''), 3000);
      },
      error: (err) => {
        this._snackBar.open(
          `Failed to ${this.isEditing ? 'updadte' : 'create'} plan`,
          'close',
          { duration: 3000 },
        );
        this.error = err.error?.message || 'Failed to save plan';
        this.loading = false;
      },
    });
  }

  deletePlan(id: string) {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    this._planService.deletePlan(id).subscribe({
      next: () => {
        this._snackBar.open('Plan deleted successfully', 'close', {
          duration: 3000,
        });
        this.success = 'Plan deleted successfully';
        this.loadPlans();
        // setTimeout(() => (this.success = ''), 3000);
      },
      error: (err) => {
        this._snackBar.open('Failed to delete plan', 'close', {
          duration: 3000,
        });
        this.error = 'Failed to delete plan';
      },
    });
  }

  editPlan(plan: ISubscriptionPlan) {
    this.isEditing = true;
    this.editingId = plan._id || null;
    this.showForm = true;
    this.planForm.patchValue(plan);
  }

  resetForm() {
    this.planForm.reset({
      price: 0,
      durationInDays: 30,
      limits: { jobs: 0, resumeViews: 0, featuredJobs: 0 },
      features: { chat: false, videoCall: false, analytics: false },
      isActive: true,
    });
    this.isEditing = false;
    this.editingId = null;
    this.showForm = false;
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
