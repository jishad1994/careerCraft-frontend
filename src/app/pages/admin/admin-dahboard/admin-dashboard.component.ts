import { Component, Output, ViewChild, inject } from '@angular/core';
import { ReusableTableComponent } from '../../../shared/components/reusable-table/reusable-table.component';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../features/admin/sidebar/sidebar.component';
import { AdminService } from '../../../services/admin/user-management/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  selector: 'app-admin-dahboard',
  imports: [CommonModule, SidebarComponent, RouterOutlet],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent {
   private _adminService = inject(AdminService);
   private _snackBar = inject(MatSnackBar);
   private _authService = inject(AuthService);
   private _router = inject(Router);


   @ViewChild('sidebarComponent') sidebar!: SidebarComponent;
  toggleMobileSidebar(): void {
    if (this.sidebar) {
      this.sidebar.toggleMobileSidebar();
    }
  }
  logout() {
    this._authService.logout();
    localStorage.clear();
    this._router.navigate(['auth/login']);
    
  }
}
