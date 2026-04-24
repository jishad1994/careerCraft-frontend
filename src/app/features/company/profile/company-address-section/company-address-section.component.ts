import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  CompanyProfile,
  IAddress,
} from '../../../../models/company/company-profile.model';
import { CompanyProfileService } from '../../../../services/company/profile/company-profile.service';
import { Subject, takeUntil } from 'rxjs';
@Component({
  selector: 'app-company-address-section',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
  ],
  templateUrl: './company-address-section.component.html',
  styleUrl: './company-address-section.component.css',
})
export class CompanyAddressSectionComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly companyProfileService = inject(CompanyProfileService);
  private readonly snackBar = inject(MatSnackBar);

  @Input() profile!: CompanyProfile;
  @Output() updatedProfile = new EventEmitter<CompanyProfile>();

  addressForm!: FormGroup;
  isEditing = false;
  isSaving = false;
  maxAddresses = 5;

  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeForm(): void {
    this.addressForm = this.fb.group({
      addresses: this.fb.array([]),
    });

    // Load existing addresses
    if (this.profile?.address && this.profile.address.length > 0) {
      this.profile.address.forEach((addr) => {
        this.addresses.push(this.createAddressFormGroup(addr));
      });
    }
  }

  get addresses(): FormArray {
    return this.addressForm.get('addresses') as FormArray;
  }

  createAddressFormGroup(address?: IAddress): FormGroup {
    return this.fb.group({
      city: [
        address?.city || '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
          Validators.pattern(/^[a-zA-Z\s]+$/),
        ],
      ],
      state: [
        address?.state || '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
          Validators.pattern(/^[a-zA-Z\s]+$/),
        ],
      ],
      country: [
        address?.country || '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
          Validators.pattern(/^[a-zA-Z\s]+$/),
        ],
      ],
      postalCode: [
        address?.postalCode || '',
        [Validators.required, Validators.pattern(/^[A-Z0-9\s-]{3,10}$/i)],
      ],
    });
  }

  addAddress(): void {
    if (this.addresses.length >= this.maxAddresses) {
      this.snackBar.open(
        `Maximum ${this.maxAddresses} addresses allowed`,
        'Close',
        { duration: 3000 },
      );
      return;
    }

    this.addresses.push(this.createAddressFormGroup());
    if (!this.isEditing) {
      this.isEditing = true;
    }
  }

  removeAddress(index: number): void {
    this.addresses.removeAt(index);

    // Auto-save when removing if we have at least one address
    if ( !this.isEditing) {
      this.saveAddresses();
    }
  }

  startEditing(): void {
    this.isEditing = true;
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.addresses.clear();

    // Reload existing addresses
    if (this.profile?.address && this.profile.address.length > 0) {
      this.profile.address.forEach((addr) => {
        this.addresses.push(this.createAddressFormGroup(addr));
      });
    }
  }

  saveAddresses(): void {
    if (this.addressForm.invalid) {
      this.markAllAsTouched();
      this.snackBar.open(
        'Please fix all validation errors before saving',
        'Close',
        { duration: 3000 },
      );
      return;
    }

    this.isSaving = true;
    const addressData: IAddress[] = this.addresses.value;
console.log(addressData);
    this.companyProfileService
      .updateAddress(addressData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.updatedProfile.emit(response.data);
            this.isEditing = false;
            this.snackBar.open('Addresses updated successfully', 'Close', {
              duration: 2000,
            });
          }
          this.isSaving = false;
        },
        error: (error) => {
          this.snackBar.open(
            error.error?.message || 'Failed to update addresses',
            'Close',
            { duration: 3000 },
          );
          this.isSaving = false;
        },
      });
  }

  private markAllAsTouched(): void {
    this.addresses.controls.forEach((control) => {
      control.markAllAsTouched();
    });
  }

  getFieldError(addressIndex: number, fieldName: string): string {
    const addressControl = this.addresses.at(addressIndex);
    if (!addressControl) return '';

    const fieldControl = addressControl.get(fieldName);
    if (!fieldControl || !fieldControl.errors || !fieldControl.touched) {
      return '';
    }

    if (fieldControl.errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (fieldControl.errors['minlength']) {
      return `${this.getFieldLabel(fieldName)} must be at least ${fieldControl.errors['minlength'].requiredLength} characters`;
    }
    if (fieldControl.errors['maxlength']) {
      return `${this.getFieldLabel(fieldName)} must not exceed ${fieldControl.errors['maxlength'].requiredLength} characters`;
    }
    if (fieldControl.errors['pattern']) {
      if (fieldName === 'postalCode') {
        return 'Invalid postal code format';
      }
      return `${this.getFieldLabel(fieldName)} contains invalid characters`;
    }

    return '';
  }

  hasFieldError(addressIndex: number, fieldName: string): boolean {
    const addressControl = this.addresses.at(addressIndex);
    if (!addressControl) return false;

    const fieldControl = addressControl.get(fieldName);
    return !!(fieldControl && fieldControl.invalid && fieldControl.touched);
  }

  private getFieldLabel(field: string): string {
    const labels: Record<string, string> = {
      city: 'City',
      state: 'State',
      country: 'Country',
      postalCode: 'Postal Code',
    };
    return labels[field] || field;
  }

  get canAddMore(): boolean {
    return this.addresses.length < this.maxAddresses;
  }

  get hasAddresses(): boolean {
    return this.addresses.length > 0;
  }
}
