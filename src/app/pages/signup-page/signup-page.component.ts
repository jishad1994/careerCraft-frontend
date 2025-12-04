import { Component, OnDestroy } from '@angular/core';
import { SignupComponent } from '../../shared/components/signup/signup.component';
import { GoogleAuthService } from '../../services/google-auth-service/google-auth.service';
import { environment } from '../../environments/environment';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
declare const google: any;
@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [SignupComponent],
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.css'],
})
export class SignupPageComponent implements OnDestroy {
  private _clientId = environment.GOOGLE_CLIENT_ID;

  destroy$ = new Subject<void>();
  constructor(
    private _googleAuth: GoogleAuthService,
    private _snackBar: MatSnackBar,
    private _router: Router
  ) {}

  onGoogleSignup(event: { role: 'user' | 'company'; elementId: string }) {
    google.accounts.id.initialize({
      client_id: this._clientId,
      callback: (response: any) =>
        this._googleAuth
          .handleCredentialResponse(response, event.role)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response: any) => {      
              this._router.navigate([`${response.user.role}/home`]);
            },
            error: (error: any) => {
              console.log(error);
              this._snackBar.open('google login failed', 'close');
            },
          }),
      auto_select: false,
      ux_mode: 'popup',
    });

    google.accounts.id.renderButton(document.getElementById(event.elementId), {
      theme: 'outline',
      size: 'large',
      width: 500,
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
