import { Component, AfterViewInit, OnDestroy, ViewChild, inject } from "@angular/core";
import { LoginComponent } from "../../shared/components/login/login.component";
import { environment } from "../../environments/environment";
import { AuthService } from "../../services/auth/auth.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { GoogleAuthService } from "../../services/google-auth-service/google-auth.service";
import { Subject, takeUntil } from "rxjs";
import { Store } from "@ngrx/store";
import { AppState } from "../../store/app.state";

declare const google: {
    accounts: {
        id: {
            initialize: (config: google.accounts.id.IdConfiguration) => void;
            renderButton: (
                parent: HTMLElement,
                options: google.accounts.id.GsiButtonConfiguration,
            ) => void;
        };
    };
};

@Component({
    selector: "app-login-page",
    imports: [LoginComponent],
    templateUrl: "./login-page.component.html",
    styleUrl: "./login-page.component.css",
})
export class LoginPageComponent implements AfterViewInit, OnDestroy {
    @ViewChild(LoginComponent) loginComponent!: LoginComponent;

    private _authService = inject(AuthService);
    private _snackBar = inject(MatSnackBar);
    private _router = inject(Router);
    private _route = inject(ActivatedRoute);
    private _googleAuth = inject(GoogleAuthService);
    private store = inject<Store<AppState>>(Store);

    logoUrl: string = environment.logUrl;

    private _clientId = environment.GOOGLE_CLIENT_ID;
    destroy$ = new Subject<void>();

    roleRoutes: Record<string, string> = {
        user: "/user/home",
        company: "/company/dashboard",
        admin: "/admin/dashboard",
    };

    loading = false;

    ngAfterViewInit(): void {
        this.renderGoogleButton();
    }

    handleLogin(payload: { role: string; email: string; password: string }) {
        this.loading = true;

        this._authService
            .login(payload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.loading = false;

                    if (res.success) {
                        this._snackBar.open("Login Successful", "close", {
                            duration: 2000,
                        });

                        const returnUrl = this._route.snapshot.queryParamMap.get("returnUrl");

                        if (returnUrl) {
                            this._router.navigateByUrl(returnUrl);
                            return;
                        }

                        if (res.data) {
                            const path = this.roleRoutes[res.data["role"]] || "/auth/login";
                            this._router.navigate([path]);
                        }
                    }
                },
                error: (error) => {
                    this.loading = false;
                    this._snackBar.open(error.error?.message || error.message || "Login Failed", "close", {
                        duration: 2000,
                    });
                },
            });
    }

    private renderGoogleButton(): void {
        const element = document.getElementById("google-login-btn");

        if (!element) {
            return;
        }

        google.accounts.id.initialize({
            client_id: this._clientId,
            callback: (response: google.accounts.id.CredentialResponse) => {
                const credential = response.credential;
                const role = this.loginComponent.selectedLoginRole;

                this._googleAuth
                    .handleCredentialResponse(credential, role)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: (res) => {
                            if (res.success) {
                                this._snackBar.open("Login Successful", "close", {
                                    duration: 2000,
                                });

                                const returnUrl = this._route.snapshot.queryParamMap.get("returnUrl");

                                if (returnUrl) {
                                    this._router.navigateByUrl(returnUrl);
                                    return;
                                }

                                const path = this.roleRoutes[res.data.user?.role] || "/auth/login";
                                this._router.navigate([path]);
                            }
                        },
                        error: (error) => {
                            this._snackBar.open(
                                error.error?.message || error.message || "Login Failed",
                                "close",
                                { duration: 2000 },
                            );
                        },
                    });
            },
            auto_select: false,
            ux_mode: "popup",
        });

        google.accounts.id.renderButton(element, {
            type: "standard",
            theme: "outline",
            size: "large",
            width: 360,
            text: "continue_with",
            locale: "en",
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}