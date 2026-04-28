import { Component, OnDestroy, inject } from "@angular/core";
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
export class SignupPageComponent implements OnDestroy {
    private _googleAuth = inject(GoogleAuthService);
    private _snackBar = inject(MatSnackBar);
    private _router = inject(Router);

    private _clientId = environment.GOOGLE_CLIENT_ID;

    destroy$ = new Subject<void>();

    onGoogleSignup(event: { role: "user" | "company"; elementId: string }) {
        google.accounts.id.initialize({
            client_id: this._clientId,
            callback: (response: google.accounts.id.CredentialResponse) =>
                this._googleAuth
                    .handleCredentialResponse(response, event.role)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: (response) => {
                            this._router.navigate([`${response.data.user.role}/home`]);
                        },
                        error: (error) => {
                            console.log(error);
                            this._snackBar.open("google login failed", "close");
                        },
                    }),
            auto_select: false,
            ux_mode: "popup",
        });
        const element = document.getElementById(event.elementId);
        if (!element) return;
        google.accounts.id.renderButton(element, {
            type: "standard",
            theme: "outline",
            size: "large",
            width: 500,
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
