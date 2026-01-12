import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  COMPANY_NAME_REGEX,
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
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FormValidators } from '../../../validators/form.validators';
import { SignupFormHelper } from '../../../helpers/signup-form.helper';
import { AuthService } from '../../../services/auth/auth.service';
import { SignupServiceHandler } from '../../../services/signup-service.handler';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit, OnDestroy {
  registerForm: FormGroup;
  selectedRole: 'user' | 'company' = 'user';
  private destroy$ = new Subject<void>();

  @Output() GoogleSignupButton = new EventEmitter<{
    role: 'user' | 'company';
    elementId: string;
  }>();

  constructor(
    private FB: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    private formValidator: FormValidators,
    private router: Router,
    private signupFormHelper: SignupFormHelper,
    private signupServiceHandler: SignupServiceHandler,
    private _snackBar: MatSnackBar
  ) {
    this.registerForm = this.FB.group(
      {
        role: ['user', [Validators.required]],
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
        companyName: [
          '',
          [
            Validators.minLength(2),
            Validators.maxLength(50),
            Validators.pattern(COMPANY_NAME_REGEX),
          ],
        ],
        email: [
          '',
          [Validators.required, Validators.email],
          [this.formValidator.phoneOrEmailUniqueValidator(this.selectedRole)],
        ],
        phone: [
          '',
          [Validators.required, Validators.pattern(PHONE_REGEX)],
          [this.formValidator.phoneOrEmailUniqueValidator(this.selectedRole)],
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

  ngOnInit(): void {
    this.setupRoleChangeListener();
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupRoleChangeListener(): void {
    this.registerForm
      .get('role')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((role: 'user' | 'company') => {
        this.selectedRole = role;
        this.signupFormHelper.updateValidatorsForRole(this.registerForm, role);
      });
  }

  signup() {
    if (this.registerForm.invalid) {
      this.signupFormHelper.markAllFieldsAsTouched(this.registerForm);
      return;
    }

    const formData = this.signupFormHelper.prepareFormDataForSubmission(
      this.registerForm.value
    );

    this.signupServiceHandler
      .handleSignup(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.signupServiceHandler.handleOTPResponse(
            response,
            this.registerForm.get('email')?.value,
            this.selectedRole
          );
        },
        error: (error) => {
          if (error.status == 422) {
            this._snackBar.open(
              `${error.error?.errors[0]?.field} is not valid`,
              'close',
              { duration: 2000 }
            );
          } else {
            this._snackBar.open(
              'Something went wrong.Please try again',
              'close',
              { duration: 2000 }
            );
          }
        },
      });
  }

  // Getter for easy access in template
  get isCompanyMode() {
    return this.selectedRole === 'company';
  }

  get isUserMode() {
    return this.selectedRole === 'user';
  }

  handleGoogleSignup() {
    console.log('google signup button clicked');
    this.GoogleSignupButton.emit({
      role: this.selectedRole,
      elementId: 'google-login',
    });
  }
}
