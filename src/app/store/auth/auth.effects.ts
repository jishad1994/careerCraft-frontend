import { Injectable, inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { AuthService } from "../../services/auth/auth.service";
import {
    loginRequest,
    loginSuccess,
    loginFailure,
    googleLoginRequest,
    googleLoginSuccess,
    googleLoginFailure,
    logoutRequest,
    logoutSuccess,
    logoutFailure,
} from "./auth.actions";
import { catchError, map, mergeMap, of, tap } from "rxjs";
import { Router } from "@angular/router";
import { GoogleAuthService } from "../../services/google-auth-service/google-auth.service";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable()
export class AuthEffects {
    private _actions$ = inject(Actions);
    private _authService = inject(AuthService);
    private _router = inject(Router);
    private _googleAuth = inject(GoogleAuthService);
    private _snackBar = inject(MatSnackBar);

    roleRoutes: Record<string, string> = {
        user: "/user/home",
        company: "/company/home",
        admin: "/admin/dashboard",
    };

    login$;
    googleLogin$;
    googleLoginSuccess$;
    loginSuccess$;
    logout$;
    logoutSuccess$;
    logoutFailure$;

    constructor() {
        this.login$ = createEffect(() =>
            this._actions$.pipe(
                ofType(loginRequest),
                mergeMap(({ email, password, role }) =>
                    this._authService.login({ email, password, role }).pipe(
                        map((response) => {
                            if (!response.success || !response.data) {
                                throw new Error(response.message || "Login failed");
                            }

                            return loginSuccess({ user: response.data });
                        }),
                        catchError((error) => {
                            const message = error?.error?.message || error?.message || "Login failed";
                            return of(loginFailure({ error: message }));
                        }),
                    ),
                ),
            ),
        );

        this.loginSuccess$ = createEffect(
            () =>
                this._actions$.pipe(
                    ofType(loginSuccess),
                    tap(({ user }) => {
                        this._snackBar.open("Login successful!", "close", {
                            duration: 3000,
                            panelClass: ["bg-green-600", "text-white"],
                        });
                        const path = this.roleRoutes[user.role] || "/auth/login";
                        this._router.navigate([path]);
                    }),
                ),
            { dispatch: false },
        );

        this.logout$ = createEffect(() =>
            this._actions$.pipe(
                ofType(logoutRequest),
                mergeMap(() =>
                    this._authService.logout().pipe(
                        map((res) => {
                            if (!res.success) {
                                throw new Error(res.message || "logout unsuccessfull");
                            }
                            return logoutSuccess();
                        }),
                        catchError((error) => of(logoutFailure({ error: error.message || "logout failed" }))),
                    ),
                ),
            ),
        );

        this.logoutSuccess$ = createEffect(
            () =>
                this._actions$.pipe(
                    ofType(logoutSuccess),
                    tap(() => {
                        this._snackBar.open("Logout successful!", "close", {
                            duration: 3000,
                            panelClass: ["bg-green-600", "text-white"],
                        });
                        localStorage.clear();
                        this._router.navigate(["/user/home"]);
                    }),
                ),
            { dispatch: false },
        );

        this.logoutFailure$ = createEffect(
            () =>
                this._actions$.pipe(
                    ofType(logoutFailure),
                    tap(({ error }) => {
                        this._snackBar.open(error, "close", {
                            duration: 3000,
                            panelClass: ["bg-red-500", "text-white"],
                        });
                    }),
                ),
            { dispatch: false },
        );

        this.googleLogin$ = createEffect(() =>
            this._actions$.pipe(
                ofType(googleLoginRequest),
                mergeMap(({ credential, role }) =>
                    this._googleAuth.handleCredentialResponse(credential, role).pipe(
                        map((res) => {
                            if (!res.success) {
                                throw new Error(res.message || "google login failed");
                            }
                            return googleLoginSuccess({ user: res.data.user });
                        }),
                        catchError(() => of(googleLoginFailure({ error: "google login failed" }))),
                    ),
                ),
            ),
        );

        this.googleLoginSuccess$ = createEffect(
            () =>
                this._actions$.pipe(
                    ofType(googleLoginSuccess),
                    tap(({ user }) => {
                        const path = this.roleRoutes[user.role] || "/auth/login";
                        this._router.navigate([path]);
                    }),
                ),
            { dispatch: false },
        );
    }
}
