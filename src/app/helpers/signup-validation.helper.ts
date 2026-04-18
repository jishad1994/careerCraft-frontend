// src/app/helpers/signup-validation.helper.ts
import { Injectable } from '@angular/core';
import { FormGroup, ValidationErrors } from '@angular/forms';
import { FormValidators } from '../validators/form.validators';

export interface ValidationError {
  field: string;
  errorType: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class SignupValidationHelper {
  getFieldError(form: FormGroup, fieldName: string): string | null {
    const field = form.get(fieldName);

    if (!field || !field.touched || !field.errors) {
      return null;
    }

    const errors = field.errors;

    // Common validation messages
    const errorMessages: Record<string, string> = {
      required: this.getRequiredMessage(fieldName),
      email: 'Enter a valid email address',
      minlength: this.getMinLengthMessage(
        fieldName,
        errors['minlength']?.requiredLength
      ),
      maxlength: this.getMaxLengthMessage(
        fieldName,
        errors['maxlength']?.requiredLength
      ),
      pattern: this.getPatternMessage(fieldName),
      //   'emailExists': 'Email already exists',
      //   'phoneExists': 'Phone number already taken'
      exists: `${fieldName} already taken`,
    };

    // Return first error found
    for (const errorType in errors) {
      if (errorMessages[errorType]) {
        return errorMessages[errorType];
      }
    }

    return 'Invalid input';
  }

  hasFieldError(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.touched && field.errors);
  }

  hasPasswordMismatchError(form: FormGroup): boolean {
    const confirmPasswordField = form.get('confirmPassword');
    return !!(
      form.errors?.['passwordMismatch'] && confirmPasswordField?.touched
    );
  }

  getAllFormErrors(form: FormGroup): ValidationError[] {
    const errors: ValidationError[] = [];

    Object.keys(form.controls).forEach((fieldName) => {
      const error = this.getFieldError(form, fieldName);
      if (error) {
        errors.push({
          field: fieldName,
          errorType: this.getFirstErrorType(form.get(fieldName)!.errors!),
          message: error,
        });
      }
    });

    // Check for form-level errors
    if (this.hasPasswordMismatchError(form)) {
      errors.push({
        field: 'confirmPassword',
        errorType: 'passwordMismatch',
        message: 'Passwords do not match',
      });
    }

    return errors;
  }

  isFormValid(form: FormGroup): boolean {
    return form.valid;
  }

  private getRequiredMessage(fieldName: string): string {
    const fieldDisplayNames: Record<string, string> = {
      firstName: 'First name',
      lastName: 'Last name',
      companyName: 'Company name',
      email: 'Email',
      phone: 'Phone number',
      password: 'Password',
      confirmPassword: 'Password confirmation',
    };

    const displayName = fieldDisplayNames[fieldName] || fieldName;
    return `${displayName} is required`;
  }

  private getMinLengthMessage(
    fieldName: string,
    requiredLength: number
  ): string {
    return `At least ${requiredLength} characters required`;
  }

  private getMaxLengthMessage(
    fieldName: string,
    requiredLength: number
  ): string {
    return `Maximum ${requiredLength} characters allowed`;
  }

  private getPatternMessage(fieldName: string): string {
    const patternMessages: Record<string, string> = {
      firstName: 'Only alphabets allowed',
      lastName: 'Only alphabets allowed',
      companyName: 'Enter a valid company name',
      phone: 'Enter a valid Indian phone number',
      password: 'Must contain uppercase, lowercase, and a number',
    };

    return patternMessages[fieldName] || 'Invalid format';
  }

  private getFirstErrorType(errors: ValidationErrors): string {
    return Object.keys(errors)[0];
  }
}
