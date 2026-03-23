import { Component, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-company-side-bar',
  imports: [CommonModule, RouterModule],
  templateUrl: './company-side-bar.component.html',
  styleUrl: './company-side-bar.component.css',
})
export class CompanySideBarComponent {
  collapsed = false;
  jobMenuOpen = false;
  isMobileMenuOpen = false;
  isDesktop = window.innerWidth >= 1024;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isDesktop = event.target.innerWidth >= 1024;
    if (this.isDesktop) {
      this.isMobileMenuOpen = false;
    }
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
    }
  }

  closeMobileMenu() {
    if (!this.isDesktop) {
      this.isMobileMenuOpen = false;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}