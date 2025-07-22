import { Component } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormGroup,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { catchError, debounceTime, map, Observable, of, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  registerForm: FormGroup;

  constructor(private FB: FormBuilder, private http: HttpClient) {
    this.registerForm = this.FB.group(
      {
        firstName: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(10),
            Validators.pattern('^[a-zA-Z]+$'),
          ],
        ],
        lastName: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(10),
            Validators.pattern('^[a-zA-Z]+$'),
          ],
        ],
        phone: [
          '',
          [Validators.required, Validators.pattern('^[6-9]\\d{9}$')],
          [this.phoneUniqueValidator.bind(this)],
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$'),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  //unique phone number validator
  phoneUniqueValidator(
    control: AbstractControl
  ): Observable<ValidationErrors | null> {
    if (!control.value) {
      return of(null);
    }
    return of(control.value).pipe(
      debounceTime(500),
      switchMap((phone) =>
        this.http.get<{ exists: boolean }>(`/api/check-phone/${phone}`)
      ),
      map((response) => (response.exists ? { phoneExists: true } : null)),
      catchError(() => of(null))
    );
  }

  //confirm password validator

  passwordMatchValidator(form: AbstractControl) {
    let password = form.get('password')?.value;
    let confirmPassword = form.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  register() {
    if (this.registerForm.invalid) {
      console.log('form not valid');
    } else {
      console.log(this.registerForm.value);
    }
  }
}
