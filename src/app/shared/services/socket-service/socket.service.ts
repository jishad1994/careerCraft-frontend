import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { INotification } from '../../../models/notification/notification.model';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket | null = null;
  private readonly connected$ = new BehaviorSubject<boolean>(false);
  private readonly notification$ = new Subject<INotification>();
  private readonly unreadCount$ = new BehaviorSubject<number>(0);
  private readonly error$ = new Subject<string>();

  constructor() {}

  connect(): void {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    this.socket = io(environment.apiUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    this.setupEventListeners();
  }

  setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.connected$.next(true);
      this.requestUnreadCount();
    });

    this.socket.on('dicsonnect', () => {
      console.log('Socket disconnected');
      this.connected$.next(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.error$.next(error.message || ' socket connection error');
    });

    this.socket.on('notification:new', (notification: INotification) => {
      console.log('New notification received:', notification);
      this.notification$.next(notification);
      this.incrementUnreadCount();
    });

    this.socket.on('notification:count', (data: { count: number }) => {
      console.log('Unread count updated:', data.count);
      this.unreadCount$.next(data.count);
    });

    //error handling for socket events
    this.socket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error.message);
      this.error$.next(error.message);
    });

    this.socket.on('reconnect', (attemptNumber: number) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      this.requestUnreadCount();
    });

    this.socket.on('reconnect_error', (error: Error) => {
      console.error('Reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Reconnection failed after all attempts');
      this.error$.next('Failed to reconnect to notification server');
    });
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected$.next(false);
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): Observable<boolean> {
    return this.connected$.asObservable();
  }

  /**
   * Get new notifications stream
   */
  onNotification(): Observable<INotification> {
    return this.notification$.asObservable();
  }

  /**
   * Get unread count stream
   */
  getUnreadCount(): Observable<number> {
    return this.unreadCount$.asObservable();
  }

  /**
   * Get error stream
   */
  onError(): Observable<string> {
    return this.error$.asObservable();
  }

  /**
   * Request current unread count from server
   */
  requestUnreadCount(): void {
    if (this.socket?.connected) {
      this.socket.emit('notification:getCount');
    }
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('notification:markRead', { notificationId });
      this.decrementUnreadCount();
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    if (this.socket?.connected) {
      this.socket.emit('notification:markAllRead');
      this.unreadCount$.next(0);
    }
  }

  /**
   * Get current connection state
   */
  getConnectionState(): boolean {
    return this.connected$.value;
  }

  /**
   * Increment unread count locally
   */
  private incrementUnreadCount(): void {
    const current = this.unreadCount$.value;
    this.unreadCount$.next(current + 1);
  }

  /**
   * Decrement unread count locally
   */
  private decrementUnreadCount(): void {
    const current = this.unreadCount$.value;
    if (current > 0) {
      this.unreadCount$.next(current - 1);
    }
  }

  /**
   * Set unread count
   */
  setUnreadCount(count: number): void {
    this.unreadCount$.next(count);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
  