import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SignupAuthService } from '../../../services/signup-auth/signup-auth.service';
import { FormValidators } from '../../../validators/form.validators';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  resetPasswordToken!: string;
  role!: 'company' | 'user';

  constructor(
    private fb: FormBuilder,
    private _authService: SignupAuthService,
    private _route: ActivatedRoute,
    private _snackBar: MatSnackBar,
    private _router: Router
  ) {
    this.resetForm = this.fb.group(
      {
        password: ['', [Validators.required]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: FormValidators.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    this.resetPasswordToken = this._route.snapshot.queryParamMap.get('token')!;
    this.role = this._route.snapshot.queryParamMap.get('role') as
      | 'user'
      | 'company';
  }

  get password() {
    return this.resetForm.get('password')!;
  }
  get confirmPassword() {
    return this.resetForm.get('confirmPassword')!;
  }

  submit() {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    const newPassword = this.password.value;
    const payload = {
      newPassword,
      resetPasswordToken: this.resetPasswordToken,
    };

    this._authService.resetPassword(payload, this.role).subscribe({
      next: () => {
        this._snackBar.open('Password reset successful!', 'Close', {
          duration: 3000,
        });
        this._router.navigate(['auth/login']);
      },
      error: (err) => {
        this._snackBar.open('Reset failed: ' + err.message, 'Close', {
          duration: 3000,
        });
      },
    });
  }
}
