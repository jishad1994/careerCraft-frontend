import { Component, HostListener, OnDestroy, OnInit, inject } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { AuthService } from "../../../services/auth/auth.service";
import { CommonModule } from "@angular/common";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Subject, takeUntil } from "rxjs";

@Component({
    selector: "app-company-side-bar",
    imports: [CommonModule, RouterModule],
    templateUrl: "./company-side-bar.component.html",
    styleUrl: "./company-side-bar.component.css",
})
export class CompanySideBarComponent implements OnInit, OnDestroy {
    private router = inject(Router);
    private authService = inject(AuthService);
    private _snackBar = inject(MatSnackBar);

    collapsed = false;
    jobMenuOpen = false;
    isMobileMenuOpen = false;
    offerMenuOpen = false;

    isDesktop = window.innerWidth >= 1024;
    destroy$ = new Subject<void>();

    @HostListener("window:resize", ["$event"])
    onResize(event: any) {
        this.isDesktop = event.target.innerWidth >= 1024;
        if (this.isDesktop) {
            this.isMobileMenuOpen = false;
        }
    }

    ngOnInit(): void {}
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    toggleSidebar() {
        if (this.isDesktop) {
            this.collapsed = !this.collapsed;
            if (!this.collapsed) {
                this.jobMenuOpen = false;
            }
        } else {
            this.isMobileMenuOpen = !this.isMobileMenuOpen;
        }
    }

    toggleJobMenu() {
        if (!this.collapsed) {
            this.jobMenuOpen = !this.jobMenuOpen;
            this.offerMenuOpen = false;
        }
    }

    closeMobileMenu() {
        if (!this.isDesktop) {
            this.isMobileMenuOpen = false;
        }
    }

    toggleOfferMenu(): void {
        if (!this.collapsed) {
            this.offerMenuOpen = !this.offerMenuOpen;
            this.jobMenuOpen = false;
        }
    }

    logout() {
        this.authService
            .logout()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success) {
                        this._snackBar.open("Logout successfull", "close", { duration: 2000 });
                        this.router.navigate(["/auth/login"]);
                    }
                },
                error: (err) => {
                    this._snackBar.open(err.message || "Logout failed", "close", { duration: 3000 });
                },
            });
    }
}
