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
  timer,
} from 'rxjs';
import { Injectable } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

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

  // unique phone number validator
  public phoneOrEmailUniqueValidator(role: string) {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }
      return timer(500).pipe(
        switchMap(() =>
          this.authService.checkPhoneOrEmailExists(control.value, role)
        ),
        map((response) => (response.data?.exists ? { exists: true } : null)),
        catchError(() => of(null))
      );
    };
  }
}
