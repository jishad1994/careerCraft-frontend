// src/app/helpers/signup-form.helper.ts
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormValidators } from '../validators/form.validators';
import {
  NAME_REGEX,
  PASSWORD_REGEX,
  PHONE_REGEX,
} from '../constants/form.constants';

export interface SignupFormData {
  role: 'user' | 'company';
  firstName?: string;
  lastName?: string;
  name?: string;
  companyName?: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SignupFormHelper {
  constructor(
    private formBuilder: FormBuilder,
    private formValidator: FormValidators
  ) {}

  updateValidatorsForRole(form: FormGroup, role: 'user' | 'company'): void {
    if (role === 'company') {
      this.setCompanyValidators(form);
      this.clearUserFields(form);
    } else {
      this.setUserValidators(form);
      this.clearCompanyFields(form);
    }
    this.updateFormValidation(form);
  }

  private setCompanyValidators(form: FormGroup): void {
    form
      .get('companyName')
      ?.setValidators([
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z\s&.-]+$/),
      ]);
    form.get('firstName')?.clearValidators();
    form.get('lastName')?.clearValidators();
  }

  private setUserValidators(form: FormGroup): void {
    form
      .get('firstName')
      ?.setValidators([
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(10),
        Validators.pattern(NAME_REGEX),
      ]);
    form
      .get('lastName')
      ?.setValidators([
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(10),
        Validators.pattern(NAME_REGEX),
      ]);
    form.get('companyName')?.clearValidators();
  }

  private clearUserFields(form: FormGroup): void {
    form.get('firstName')?.setValue('');
    form.get('lastName')?.setValue('');
  }

  private clearCompanyFields(form: FormGroup): void {
    form.get('companyName')?.setValue('');
  }

  private updateFormValidation(form: FormGroup): void {
    form.get('firstName')?.updateValueAndValidity();
    form.get('lastName')?.updateValueAndValidity();
    form.get('companyName')?.updateValueAndValidity();
  }

  markAllFieldsAsTouched(form: FormGroup): void {
    Object.keys(form.controls).forEach((key) => {
      form.get(key)?.markAsTouched();
    });
  }

  prepareFormDataForSubmission(formValue: SignupFormData): any {
    const formData = { ...formValue, phone: String(formValue.phone) };

    if (formData.role === 'company') {
      formData.name = formData.companyName;
      delete formData.firstName;
      delete formData.lastName;
      delete formData.companyName;
    } else {
      delete formData.companyName;
    }

    delete formData.confirmPassword;
    return formData;
  }
}
