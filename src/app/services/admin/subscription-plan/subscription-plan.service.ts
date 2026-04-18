import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ApiResponse } from '../../../models/api-response.model';
import { Observable, retry } from 'rxjs';
import { ISubscriptionPlan } from '../../../models/subscription-plan/subscription-plan.model';
import { ADMIN_API_END_POINTS } from '../../../constants/admin-endpoints.constants';
import { API_ENDPOINTS } from '../../../constants/api-endpoints.constants';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionPlanService {
  private _http = inject(HttpClient);


  getPlans(): Observable<ApiResponse<ISubscriptionPlan[]>> {
    return this._http.get<ApiResponse<ISubscriptionPlan[]>>(
      ADMIN_API_END_POINTS.SUBSCRIPTION_PLANS.GET_PLANS,
    );
  }

  createPlan(
    plan: ISubscriptionPlan,
  ): Observable<ApiResponse<ISubscriptionPlan>> {
    return this._http.post<ApiResponse<ISubscriptionPlan>>(
      ADMIN_API_END_POINTS.SUBSCRIPTION_PLANS.CREATE,
      plan,
    );
  }

  updatePlan(
    planId: string,
    plan: ISubscriptionPlan,
  ): Observable<ApiResponse<ISubscriptionPlan>> {
    return this._http.put<ApiResponse<ISubscriptionPlan>>(
      ADMIN_API_END_POINTS.SUBSCRIPTION_PLANS.UPDATE(planId),
      plan,
    );
  }

  deletePlan(planId: string): Observable<ApiResponse<void>> {
    return this._http.delete<ApiResponse<void>>(
      ADMIN_API_END_POINTS.SUBSCRIPTION_PLANS.DELETE(planId),
    );
  }
}
