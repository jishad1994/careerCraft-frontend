import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-company-side-bar',
  imports: [CommonModule, RouterModule],
  templateUrl: './company-side-bar.component.html',
  styleUrl: './company-side-bar.component.css',
})
export class CompanySideBarComponent {
  collapsed = false;
  jobMenuOpen = false;

  toggleSidebar() {
    this.collapsed = !this.collapsed;
    if (!this.collapsed) {
      this.jobMenuOpen = false;
    }
  }

  toggleJobMenu() {
    if (!this.collapsed) {
      this.jobMenuOpen = !this.jobMenuOpen;
    }
  }

  logout() {
    console.log('logout button clicked');
  }
}
