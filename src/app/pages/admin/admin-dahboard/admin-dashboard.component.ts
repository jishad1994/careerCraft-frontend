import { Component, Output } from '@angular/core';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../features/admin/sidebar/sidebar.component';
import { AdminService } from '../../../services/admin/user-management/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-admin-dahboard',
  imports: [CommonModule, SidebarComponent, RouterOutlet],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent {
  constructor(
    private _adminService: AdminService,
    private _snackBar: MatSnackBar,
    private _authService: AuthService,
    private _router: Router
  ) {}

  logout() {
    this._authService.logout();
    localStorage.clear();
    this._router.navigate(['auth/login']);
  }
}
