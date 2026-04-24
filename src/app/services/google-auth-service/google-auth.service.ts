import { Injectable,  inject } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { API_ENDPOINTS } from "../../constants/api-endpoints.constants";
import { AuthStateService } from "../authState/auth-state.service";
import { catchError, Observable, tap, throwError } from "rxjs";
import { ApiResponse } from "../../models/api-response.model";
import { AuthResponseUserDTO } from "../../models/auth.dto";

// declare const google: any;
@Injectable({
    providedIn: "root",
})
export class GoogleAuthService {
    private _http = inject(HttpClient);
    private _router = inject(Router);
    private _snackBar = inject(MatSnackBar);
    private _authStateService = inject(AuthStateService);

    private _clientId = environment.GOOGLE_CLIENT_ID;

    handleCredentialResponse(
        credential: string,
        role: "user" | "company",
    ): Observable<ApiResponse<{ user: AuthResponseUserDTO }>> {
        // credential is google ID token
        return this._http
            .post<ApiResponse<{ user: AuthResponseUserDTO }>>(API_ENDPOINTS.AUTH.GOOGLE_AUTH(role), { credential, role })
            .pipe(
                tap((res) => {
                    if (res.success) {
                        this._authStateService.login(res.data.user);
                    }
                }),
                catchError((error: HttpErrorResponse) => {
                    this._authStateService.logout();
                    return throwError(error);
                }),
            );
    }
}
