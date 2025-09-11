import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SignupAuthService } from '../../../services/signup-auth/signup-auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private _authService: SignupAuthService,
    private _matSnackBar: MatSnackBar
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      role: ['', [Validators.required]],
    });
  }

  get email() {
    return this.forgotForm.get('email')!;
  }

  get role() {
    return this.forgotForm.get('role')!;
  }

  async submit() {
    const payload = this.forgotForm.value;

    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
    }

    this._authService.forgotPassword(payload).subscribe({
      next: (res) => {
        if (res.success) {
          console;
          this._matSnackBar.open(
            'a password reset link has sent to you registered email',
            'close'
          );
        }
      },

      error: (err) => {
        this._matSnackBar.open(
          err?.error?.message || 'some errro has occured',
          'close'
        );
      },
    });
  }
}
