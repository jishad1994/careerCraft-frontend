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
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class FormValidators {
  constructor(private http: HttpClient, private authService: AuthService) {}

  //confirm password validator
  static passwordMatchValidator(form: AbstractControl) {
    let password = form.get('password')?.value;
    let confirmPassword = form.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

 
  //unique phone number validator

  public phoneUniqueValidator(
    control: AbstractControl
  ): Observable<ValidationErrors | null> {
    console.log('phone is checking');
    if (!control.value) {
      return of(null);
    }
    return of(control.value).pipe(
      debounceTime(500),
      switchMap((phone) => this.authService.checkPhoneExists(phone)),
      map((response) => (response.exists ? { phoneExists: true } : null)),
      catchError(() => of(null))
    );
  }

  //email unique validator
  public emailUniqueValidator(
    control: AbstractControl
  ): Observable<ValidationErrors | null> {
    if (!control.value) {
      return of(null);
    }
    return of(control.value).pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((email) => this.authService.checkEmailExists(email)),
      map((response) => (response.exists ? { emailExists: true } : null)),
      catchError(() => of(null))
    );
  }
}
