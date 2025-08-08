import { Component } from '@angular/core';
import {
  NAME_REGEX,
  PASSWORD_REGEX,
  PHONE_REGEX,
} from '../../../constants/form.constants';
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
import { AuthService } from '../../../services/auth.service';

//mat theme
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { FormValidators } from '../../../validators/form.validators';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  registerForm: FormGroup;

  constructor(
    private FB: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    private formValidator: FormValidators
  ) {
    this.registerForm = this.FB.group(
      {
        firstName: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(10),
            Validators.pattern(NAME_REGEX),
          ],
        ],
        lastName: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(10),
            Validators.pattern(NAME_REGEX),
          ],
        ],
        email: [
          '',
          [Validators.required, Validators.email],
          [formValidator.emailUniqueValidator.bind(authService)],
        ],
        phone: [
          '',
          [Validators.required, Validators.pattern(PHONE_REGEX)],
          [formValidator.phoneUniqueValidator.bind(authService)],
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(PASSWORD_REGEX),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: FormValidators.passwordMatchValidator }
    );
  }

  signup() {
    if (this.registerForm.invalid) {
      console.log('form not valid');
    } else {
      // console.log(this.registerForm.value);

      console.log( this.registerForm.value.firstName);
      this.authService.userSignup(this.registerForm.value).subscribe({
        next: (res) => console.log('Server response:', res),
        error: (err) => console.error('Error:', err),
      });
    }
  }
}
