import { HttpClient } from '@angular/common/http';
import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import {
  Observable,
  of,
  debounceTime,
  switchMap,
  map,
  catchError,
  distinctUntilChanged,
} from 'rxjs';
import { Injectable } from '@angular/core';
import { SignupAuthService } from '../services/signup-auth/signup-auth.service';

@Injectable({ providedIn: 'root' })
export class FormValidators {
  constructor(
    private http: HttpClient,
    private authService: SignupAuthService
  ) {}

  //confirm password validator
  static passwordMatchValidator(form: AbstractControl) {
    let password = form.get('password')?.value;
    let confirmPassword = form.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  // unique phone number validator

  public phoneOrEmailUniqueValidator(role: string) {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }
      return of(control.value).pipe(
        debounceTime(500),
        switchMap((phoneOrEmail) =>
          this.authService.checkPhoneOrEmailExists(phoneOrEmail, role)
        ),
        map((response) => (response.exists ? { exists: true } : null)),
        catchError(() => of(null))
      );
    };
  }
}
