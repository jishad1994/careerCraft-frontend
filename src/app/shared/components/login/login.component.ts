import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;

  @Input() heading: string = '';
  @Input() buttonLabel: string = '';
  @Output() submitForm = new EventEmitter<{
    email: string;
    password: string;
  }>();

  constructor(private FB: FormBuilder) {
    this.loginForm = this.FB.group({
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$'),
        ],
      ],
    });
  }

  submit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      console.log('Invalid login credentials');
    } else {
      console.log('Valid login credentials:', this.loginForm.value);
      this.submitForm.emit(this.loginForm.value);
    }
  }

  // Getters for easy access in the template
  get email() {
    return this.loginForm.get('email')!;
  }

  get password() {
    return this.loginForm.get('password')!;
  }
}
