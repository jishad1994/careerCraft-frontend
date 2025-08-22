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
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

//mat theme
import { FormValidators } from '../../../validators/form.validators';
import { userRegister } from '../../../models/auth.interface';
import { OtpVerificationComponent } from '../otp-verification/otp-verification.component';

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
    private formValidator: FormValidators,
    private router: Router
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
          [formValidator.emailUniqueValidator.bind(this.formValidator)],
        ],
        phone: [
          '',
          [Validators.required, Validators.pattern(PHONE_REGEX)],
          [formValidator.phoneUniqueValidator.bind(this.formValidator)],
        ],
        role: ['user'], //fixed role for users
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
      this.authService.requestOTP(this.registerForm.value).subscribe({
        next: (res) => {
          if (res.success) {
            //save the user email in the local storage for later retrieval
            localStorage.setItem('userEmail', res.email);
            //navigate to OTP verification page
            this.router.navigate(['user/OTP-verification'], {
              state: {
                userEmail: this.registerForm.get('email')?.value, //keep the emai in the state
              },
            });
          } else {
            //toast logic


  
          }
        },

        error: (err) => console.error('Error:', err),
      });
    }
  }
}
