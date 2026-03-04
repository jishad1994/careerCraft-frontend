import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../models/api-response.model';
import { INotification } from '../../../models/notification/notification.model';
import { NOTIFICATION_ENDPOINTS } from '../../../constants/notification-endpoints.constants';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private _http: HttpClient) {}

  getNotifications(
    page: number,
    limit: number,
  ): Observable<ApiResponse<INotification[]>> {
    return this._http.get<ApiResponse<INotification[]>>(
      NOTIFICATION_ENDPOINTS.GET_NOTIFICATIONS,
      {
        params: { page: page.toString(), limit: limit.toString() },
      },
    );
  }

  markAsRead(notificationId: string): Observable<ApiResponse<null>> {
    return this._http.put<ApiResponse<null>>(
      NOTIFICATION_ENDPOINTS.MARK_AS_READ(notificationId),
      {},
    );
  }

  markAllAsRead(): Observable<ApiResponse<null>> {
    return this._http.put<ApiResponse<null>>(
      NOTIFICATION_ENDPOINTS.MARK_ALL_AS_READ,
      {},
    );
  }

  deleteNotification(notificationId: string): Observable<ApiResponse<null>> {
    return this._http.delete<ApiResponse<null>>(
      NOTIFICATION_ENDPOINTS.DELETE_NOTIFICATION(notificationId),
    );
  }
}
