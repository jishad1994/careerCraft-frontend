import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener, OnChanges, SimpleChanges, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { HoverScaleDirective } from "../../../custom-directives/hover-scale.directive";
import { AuthResponseUserDTO } from "../../../models/auth.dto";
import { SocketService } from "../../services/socket-service/socket.service";
import { AuthStateService } from "../../../services/authState/auth-state.service";

export interface NavItem {
    label: string;
    route?: string;
    action?: () => void;
    icon?: string;
    isPrimary?: boolean;
    children?: NavItem[];
}

@Component({
    selector: "app-header",
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, HoverScaleDirective],
    templateUrl: "./header.component.html",
    styleUrl: "./header.component.css",
})
export class HeaderComponent implements OnInit, OnDestroy, OnChanges {
    private readonly router = inject(Router);
    private readonly socketService = inject(SocketService);
    private readonly userAuthState = inject(AuthStateService);

    @Input() logoUrl = "";
    @Input() logoRoute = "/home";
    @Input() logoText = "";
    @Input() navItems: NavItem[] = [];
    @Input() userMenuItems: NavItem[] = [];
    @Input() user: AuthResponseUserDTO | null = null;
    @Input() userName = "";
    @Input() showSearch = true;
    @Input() searchPlaceholder = "";

    @Output() searchOutput = new EventEmitter<string>();
    @Output() logout = new EventEmitter<void>();

    searchQuery = "";
    isUserDropdownOpen = false;
    isSearchFocused = false;
    showMobileMenu = false;
    // Total unread count only
    unreadCount = 0;

    private readonly destroy$ = new Subject<void>();
    private notificationsInitialized = false;

    ngOnInit(): void {
        this.userAuthState.authState$.pipe(takeUntil(this.destroy$)).subscribe((state) => (this.user = state.user));
        if (this.user) {

          console.log('user',this.user)
            this.socketService.connect();
            console.log("notifications intialized");
            this.initializeNotifications();
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
    ngOnChanges(changes: SimpleChanges): void {
        if (changes["user"]) {
            this.resetNotifications();

            if (this.user) {
                this.initializeNotifications();
            }
        }
    }

    private initializeNotifications(): void {
        if (this.notificationsInitialized) return;

        this.notificationsInitialized = true;
        this.socketService.requestUnreadCount();
        // Subscribe to total unread count
        this.socketService
            .getUnreadCount()
            .pipe(takeUntil(this.destroy$))
            .subscribe((count) => {
                console.log("notifications undread count reci ", count);
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
    }

    private resetNotifications(): void {
        this.unreadCount = 0;
        this.notificationsInitialized = false;
    }

    goToNotifications(): void {
        if (!this.user) return;
        this.router.navigate([`${this.user.role == "company" ? "company/dashboard" : "user"}/notifications`]);
    }

    onSearch(): void {
        if (this.searchQuery.trim()) {
            this.searchOutput.emit(this.searchQuery);
            this.searchQuery = "";
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

    @HostListener("document:click", ["$event"])
    onClickOutside(event: Event): void {
        const target = event.target as HTMLElement;
        if (!target.closest(".dropdown-container")) {
            this.isUserDropdownOpen = false;
        }
        if (!target.closest(".mobile-menu-container")) {
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
        this.socketService.disconnect();
        this.logout.emit();
        this.closeUserDropdown();
    }

    getUserInitials(name?: string): string {
        if (!name) return "U";
        const parts = name.split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }
}
