import { Component, ViewChild, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SidebarComponent } from "../../../features/admin/sidebar/sidebar.component";
import { AdminService } from "../../../services/admin/user-management/admin.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router, RouterOutlet } from "@angular/router";
import { AuthService } from "../../../services/auth/auth.service";
import { AuthStateService } from "../../../services/authState/auth-state.service";
import { AuthResponseUserDTO } from "../../../models/auth.dto";

@Component({
    selector: "app-admin-dahboard",
    imports: [CommonModule, SidebarComponent, RouterOutlet],
    templateUrl: "./admin-dashboard.component.html",
    styleUrl: "./admin-dashboard.component.css",
})
export class AdminDashboardComponent {
    private _adminService = inject(AdminService);
    private readonly _authStateService = inject(AuthStateService);
    private _snackBar = inject(MatSnackBar);
    private _authService = inject(AuthService);
    private _router = inject(Router);

    @ViewChild("sidebarComponent") sidebar!: SidebarComponent;
    toggleMobileSidebar(): void {
        if (this.sidebar) {
            this.sidebar.toggleMobileSidebar();
        }
    }

    get user(): AuthResponseUserDTO | null {
        return this._authStateService.authState.user;
    }
    get userInitials(): string {
        const name = this.user?.firstName?? this.user?.email ?? "";
        return name
            .split(" ")
            .map((part: string) => part[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    }
    logout(): void {
        this._authService.logout().subscribe({
            next: () => {
                localStorage.clear();
                this._router.navigate(["/auth/login"]);
            },
            error: () => {
                localStorage.clear();
                this._router.navigate(["/auth/login"]);
            },
        });
    }
}
