import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { Route, Router } from '@angular/router';
import { PASSWORD_REGEX } from '../../../constants/form.constants';
import { RouterLink } from '@angular/router';
import { NoSpaceDirective } from '../../../custom-directives/no-space.directive';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink,NoSpaceDirective],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  selectedRole: 'user' | 'company' = 'user';

  @Output() onGoogleLogin = new EventEmitter<{
    role: 'company' | 'user';
    elementId: string;
  }>();

  @Input() loading: boolean = false;
  @Output() formSubmit = new EventEmitter<{
    role: string;
    email: string;
    password: string;
  }>();

  constructor(private FB: FormBuilder) {
    this.loginForm = this.FB.group({
      role: ['user', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(PASSWORD_REGEX)]],
    });
  }

  submit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.formSubmit.emit(this.loginForm.value);
  }

  get email() {
    return this.loginForm.get('email')!;
  }

  get password() {
    return this.loginForm.get('password')!;
  }

  handleGoogleLogin() {
    const role = this.loginForm.get('role')?.value as 'user' | 'company';
    this.onGoogleLogin.emit({ role, elementId: 'google-login-btn' });
  }
}
