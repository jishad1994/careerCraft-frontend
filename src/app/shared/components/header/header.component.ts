// Frontend: src/app/shared/components/header/header.component.ts

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
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { HoverScaleDirective } from '../../../custom-directives/hover-scale.directive';
import { AuthResponseUserDTO } from '../../../models/auth.dto';
import { SocketService } from '../../services/socket-service/socket.service';

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
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HoverScaleDirective],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit, OnDestroy {
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

  // Total unread count only
  unreadCount = 0;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly router: Router,
    private readonly socketService: SocketService,
  ) {
    socketService.connect();
  }

  ngOnInit(): void {
    if (this.user) {
      this.initializeNotifications();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeNotifications(): void {
    // Subscribe to total unread count
    this.socketService
      .getUnreadCount()
      .pipe(takeUntil(this.destroy$))
      .subscribe((count) => {
        this.unreadCount = count;
      });

    // Listen for new notifications
    this.socketService
      .onNotification()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Request updated count
        this.socketService.requestUnreadCount();
      });

    // Request initial count
    this.socketService.requestUnreadCount();
  }

  goToNotifications(): void {
    if (!this.user) return;
    this.router.navigate([
      `${this.user.role == 'company' ? 'company/dashboard' : 'user'}/notifications`,
    ]);
  }

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
