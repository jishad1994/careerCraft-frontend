import { AfterViewInit, Component, OnDestroy, ViewChild, inject } from "@angular/core";
import { SignupComponent } from "../../shared/components/signup/signup.component";
import { GoogleAuthService } from "../../services/google-auth-service/google-auth.service";
import { environment } from "../../environments/environment";
import { Subject, takeUntil } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";

declare const google: {
    accounts: {
        id: {
            initialize: (config: google.accounts.id.IdConfiguration) => void;
            renderButton: (parent: HTMLElement, options: google.accounts.id.GsiButtonConfiguration) => void;
        };
    };
};

@Component({
    selector: "app-signup-page",
    standalone: true,
    imports: [SignupComponent],
    templateUrl: "./signup-page.component.html",
    styleUrls: ["./signup-page.component.css"],
})
export class SignupPageComponent implements AfterViewInit, OnDestroy {
    @ViewChild(SignupComponent) signupComponent!: SignupComponent;

    private _googleAuth = inject(GoogleAuthService);
    private _snackBar = inject(MatSnackBar);
    private _router = inject(Router);

    private _clientId = environment.GOOGLE_CLIENT_ID;

    destroy$ = new Subject<void>();

    ngAfterViewInit(): void {
        this.renderGoogleSignupButton();
    }

    private renderGoogleSignupButton(): void {
        const element = document.getElementById("google-signup-btn");

        if (!element) {
            return;
        }

        google.accounts.id.initialize({
            client_id: this._clientId,
            callback: (response: google.accounts.id.CredentialResponse) => {
                const credential = response.credential;
                const role = this.signupComponent.selectedSignupRole;

                this._googleAuth
                    .handleCredentialResponse(credential, role)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: (response) => {
                            const userRole = response.data.user.role;

                            if (userRole === "company") {
                                this._router.navigate(["/company/dashboard"]);
                                return;
                            }

                            this._router.navigate(["/user/home"]);
                        },
                        error: () => {
                            this._snackBar.open("Google signup failed", "close", {
                                duration: 2000,
                            });
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
