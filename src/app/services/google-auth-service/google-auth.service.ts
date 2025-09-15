import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

declare const google: any;
@Injectable({
  providedIn: 'root',
})
export class GoogleAuthService {
  private _clientId = environment.GOOGLE_CLIENT_ID;
  constructor(
    private _http: HttpClient,
    private _router: Router,
    private _snackBar: MatSnackBar
  ) {}

  initGoogle(elementId: string, role: 'user' | 'company') {
    google.accounts.id.initialize({
      client_id: this._clientId,
      callback: (response: any) =>
        this.handleCredentialResponse(response, role),
      auto_select: false,
      ux_mode: 'popup',
    });

    google.accounts.id.renderButton(document.getElementById(elementId), {
      theme: 'outline',
      size: 'large',
      width: 500,
    });
  }

  private handleCredentialResponse(resp: any, role: 'user' | 'company') {
    const credential = resp.credential; //google ID token
    this._http
      .post(
        `${environment.apiUrl}/api/auth/${role}/googleLogin`,
        { credential, role },
        { withCredentials: true }
      )
      .subscribe({
        next: (response: any) => {
          localStorage.setItem('accessToken', response.accessToken);

          console.log(typeof resp.user)
          localStorage.setItem('user', JSON.stringify(response.user));
          localStorage.setItem('userRole', response.user.role);
          localStorage.setItem('userEmail', response.user.email);
          this._router.navigate([`${role}/home`]);
        },
        error: (error: any) => {
          console.log(error);
          this._snackBar.open('google login failed', 'close');
        },
      });
  }
}
