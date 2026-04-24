import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PASSWORD_REGEX } from '../../../constants/form.constants';
import { RouterLink } from '@angular/router';
import { NoSpaceDirective } from '../../../custom-directives/no-space.directive';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NoSpaceDirective],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  private FB = inject(FormBuilder);

  loginForm: FormGroup;
  selectedRole: 'user' | 'company' = 'user';

  @Output() googleLogin = new EventEmitter<{
    role: 'company' | 'user';
    elementId: string;
  }>();

  @Input() loading = false;
  @Output() formSubmit = new EventEmitter<{
    role: string;
    email: string;
    password: string;
  }>();

  constructor() {
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

  selectRole(role: 'user' | 'company'): void {
    this.selectedRole = role;
  }

  handleGoogleLogin() {
    const role = this.loginForm.get('role')?.value as 'user' | 'company';
    this.googleLogin.emit({ role, elementId: 'google-login-btn' });
  }
}
