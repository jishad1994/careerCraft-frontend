import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, Subject, take, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthStateService } from '../../../services/authState/auth-state.service';
import { AuthService } from '../../../services/auth/auth.service';
import { HoverScaleDirective } from '../../../custom-directives/hover-scale.directive';
import { AuthResponseUserDTO } from '../../../models/auth.dto';

export interface NavItem {
  label: string;
  route?: string;
  action?: () => void;
  icon?: string;
  isPrimary?: boolean;
  children?: NavItem[];
}
@Component({
  selector: 'app-header',
  imports: [CommonModule, FormsModule, RouterLink,HoverScaleDirective],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent  {
  @Input() logoUrl: string = '';
  @Input() logoRoute: string = '/home';
  @Input() logoText: string = '';
  @Input() navItems: NavItem[] = [];
  @Input() userMenuItems: NavItem[] = [];
  @Input() user: AuthResponseUserDTO | null = null;
  @Input() userName: string = '';
  @Input() showSearch: boolean = true;
  @Input() searchPlaceholder: string = '';

  @Output() search = new EventEmitter<string>();
  @Output() logout = new EventEmitter<void>();
  searchQuery = '';
  isUserDropdownOpen = false;
  isSearchFocused = false;
  showMobileMenu = false;

 

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.search.emit(this.searchQuery);
      this.searchQuery = '';
      this.isSearchFocused = false;
    }
  }

  toggleUserDropdown(): void {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  closeUserDropdown(): void {
    this.isUserDropdownOpen = false;
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      this.isUserDropdownOpen = false;
    }
    if (!target.closest('.mobile-menu-container')) {
      this.showMobileMenu = false;
    }
  }

  handleNavAction(item: NavItem): void {
    if (item.action) {
      item.action();
    }
    this.showMobileMenu = false;
  }

  onLogout(): void {
    this.logout.emit();
    this.closeUserDropdown();
  }

  getUserInitials(name?: string): string {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}
