import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { API_ENDPOINTS } from '../../constants/api-endpoints.constants';

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

  handleCredentialResponse(credential: string, role: 'user' | 'company') {
    // credential is google ID token
    return this._http.post(
      API_ENDPOINTS.AUTH.GOOGLE_AUTH(role),
      { credential, role },
      { withCredentials: true }
    );
  }
}
