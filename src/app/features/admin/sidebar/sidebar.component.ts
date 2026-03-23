import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule,CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  isMobileMenuOpen = false;
  constructor(private router: Router) {}
  
  // Helper method to check if route is active
  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }

  // Toggle mobile sidebar
  toggleMobileSidebar(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // Close mobile sidebar
  closeMobileSidebar(): void {
    this.isMobileMenuOpen = false;
  }
}
