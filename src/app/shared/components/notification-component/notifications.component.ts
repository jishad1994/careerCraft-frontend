import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  INotification,
  NotificationPriority,
} from '../../../models/notification/notification.model';
import { SocketService } from '../../services/socket-service/socket.service';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification-service/notification.service';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css',
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: INotification[] = [];
  loading = false;
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  pageSize = 20;
  hasNextPage = false;
  hasPrevPage = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly notificationService: NotificationService,
    private readonly socketService: SocketService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.listenToNewNotifications();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadNotifications(): void {
    this.loading = true;

    this.notificationService
      .getNotifications(this.currentPage, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.notifications = response.data as INotification[];

            if (response.pagination) {
              this.totalPages = response.pagination.totalPages;
              this.totalItems = response.pagination.totalItems;
              this.hasNextPage = response.pagination.hasNextPage;
              this.hasPrevPage = response.pagination.hasPrevPage;
            }
          }
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  listenToNewNotifications(): void {
    this.socketService
      .onNotification()
      .pipe(takeUntil(this.destroy$))
      .subscribe((notification) => {
        // Add new notification to top of list
        this.notifications.unshift(notification);
      });
  }

  markAsRead(notification: INotification): void {
    if (notification.isRead) return;

    this.notificationService
      .markAsRead(notification._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            notification.isRead = true;
            this.socketService.requestUnreadCount();
          }
        },
      });
  }

  markAllAsRead(): void {
    if (confirm('Mark all notifications as read?')) {
      this.notificationService
        .markAllAsRead()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.notifications.forEach((n) => (n.isRead = true));
              this.socketService.requestUnreadCount();
            }
          },
        });
    }
  }

  deleteNotification(notification: INotification, event: Event): void {
    event.stopPropagation();

    if (confirm('Delete this notification?')) {
      this.notificationService
        .deleteNotification(notification._id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.notifications = this.notifications.filter(
                (n) => n._id !== notification._id,
              );
              this.totalItems--;
              this.socketService.requestUnreadCount();
            }
          },
        });
    }
  }

  // deleteAllRead(): void {
  //   if (confirm('Delete all read notifications?')) {
  //     this.notificationService
  //       .deleteAllRead()
  //       .pipe(takeUntil(this.destroy$))
  //       .subscribe({
  //         next: (response) => {
  //           if (response.success) {
  //             this.notifications = this.notifications.filter((n) => !n.isRead);
  //             this.loadNotifications(); // Reload to update counts
  //           }
  //         },
  //       });
  //   }
  // }

  clearAll(): void {
    if (confirm('Clear ALL notifications? This cannot be undone.')) {
      const deletePromises = this.notifications.map((n) =>
        this.notificationService.deleteNotification(n._id).toPromise(),
      );

      Promise.all(deletePromises).then(() => {
        this.notifications = [];
        this.loadNotifications();
      });
    }
  }

  onNotificationClick(notification: INotification): void {
    this.markAsRead(notification);

    if (notification.link) {
      this.router.navigate([notification.link]);
    }
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadNotifications();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.goToPage(this.currentPage + 1);
    }
  }

  prevPage(): void {
    if (this.hasPrevPage) {
      this.goToPage(this.currentPage - 1);
    }
  }

  getPriorityBadgeClass(priority: NotificationPriority): string {
    const classes: { [key in NotificationPriority]: string } = {
      urgent: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-blue-100 text-blue-800 border-blue-200',
      low: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return classes[priority];
  }

  getNotificationIcon(type: string): string {
    const icons: { [key: string]: string } = {
      application_status:
        'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      new_application:
        'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      interview_scheduled:
        'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      message:
        'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      job_posted:
        'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      default:
        'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    };
    return icons[type] || icons['default'];
  }

  getNotificationColorClass(type: string): string {
    const colors: { [key: string]: string } = {
      application_status: 'bg-blue-100 text-blue-600',
      new_application: 'bg-green-100 text-green-600',
      interview_scheduled: 'bg-purple-100 text-purple-600',
      message: 'bg-yellow-100 text-yellow-600',
      job_posted: 'bg-indigo-100 text-indigo-600',
      system: 'bg-gray-100 text-gray-600',
    };
    return colors[type] || colors['system'];
  }

  getTimeAgo(date: string): string {
    const now = new Date();
    const notificationDate = new Date(date);
    const seconds = Math.floor(
      (now.getTime() - notificationDate.getTime()) / 1000,
    );

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return notificationDate.toLocaleDateString();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, -1, total);
      } else if (current >= total - 2) {
        pages.push(1, -1, total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, -1, current - 1, current, current + 1, -1, total);
      }
    }

    return pages;
  }

  //to current page limit for pagination display

  toCurrentPageLimit(
    currentPage: number,
    pageSize: number,
    totalItems: number,
  ): number {
    return Math.min(currentPage * pageSize, totalItems);
  }
}
