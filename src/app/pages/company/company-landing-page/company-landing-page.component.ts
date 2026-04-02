import { Component, OnInit } from "@angular/core";
import { HeaderComponent } from "../../../shared/components/header/header.component";
import { FooterComponent } from "../../../shared/components/footer/footer.component";
import { AuthService } from "../../../services/auth/auth.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { AuthStateService } from "../../../services/authState/auth-state.service";
import { Subject, takeUntil } from "rxjs";

@Component({
    selector: "app-company-landing-page",
    imports: [],
    templateUrl: "./company-landing-page.component.html",
    styleUrl: "./company-landing-page.component.css",
})
export class CompanyLandingPageComponent implements OnInit {
    employerName: string = "employer";

    destroy$ = new Subject<void>();

    constructor(
        private _authService: AuthService,
        private _snackbar: MatSnackBar,
        private _router: Router,
        private readonly _authState: AuthStateService,
    ) {}

    handleLogout() {
        this._authService.logout().subscribe({
            next: (res) => {
                if (res.success) {
                    this._snackbar.open("logout successfull", "close", {
                        duration: 2000,
                    });

                    this._router.navigate(["/auth/login"]);
                }
            },
            error: (error) => {
                this._snackbar.open("some error occured", "close", {
                    duration: 2000,
                });
            },
        });
    }

    ngOnInit(): void {
        this._authState.authState$.pipe(takeUntil(this.destroy$)).subscribe((state) => {
            if (state.user?.name) {
                this.employerName = state.user?.name;
            }
        });
    }
}
