import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../models/api-response.model';
import {
  CompanySubscription,
  RemainingLimits,
} from '../../../models/company/company-subscription.model';
import { COMPANY_API_ENDPOINTS } from '../../../constants/company-api-endpoints.constants';
import { ISubscriptionPlan } from '../../../models/subscription-plan/subscription-plan.model';

@Injectable({
  providedIn: 'root',
})
export class CompanySubscriptionService {
  constructor(private readonly _http: HttpClient) {}

  getActiveSubscription(): Observable<ApiResponse<CompanySubscription>> {
    return this._http.get<ApiResponse<CompanySubscription>>(
      COMPANY_API_ENDPOINTS.SUBSCRIPTION.GET_ACTIVE_SUBSCRIPTION,
    );
  }

  getPlans(): Observable<ApiResponse<ISubscriptionPlan[]>> {
    return this._http.get<ApiResponse<ISubscriptionPlan[]>>(
      COMPANY_API_ENDPOINTS.SUBSCRIPTION.GET_ALL_ACTIVE_PLANS,
    );
  }

  getPlanById(planId: string): Observable<ApiResponse<ISubscriptionPlan>> {
    return this._http.get<ApiResponse<ISubscriptionPlan>>(
      COMPANY_API_ENDPOINTS.SUBSCRIPTION.GET_PLAN_BY_ID(planId),
    );
  }

  getRemainingLimits(): Observable<ApiResponse<RemainingLimits>> {
    return this._http.get<ApiResponse<RemainingLimits>>(
      COMPANY_API_ENDPOINTS.SUBSCRIPTION.GET_REMAINING_SUBSCRIPTION_LIMITS,
    );
  }

  cancelSubscription(
    reason: string,
  ): Observable<ApiResponse<CompanySubscription>> {
    return this._http.post<ApiResponse<CompanySubscription>>(
      COMPANY_API_ENDPOINTS.SUBSCRIPTION.CANCEL_SUSBCRIPTION,
      { reason },
    );
  }

 

  upgradeSubscription(
    planId: string,
  ): Observable<
    ApiResponse<{ subscription: CompanySubscription; paymentUrl: string }>
  > {
    return this._http.post<
      ApiResponse<{ subscription: CompanySubscription; paymentUrl: string }>
    >(COMPANY_API_ENDPOINTS.SUBSCRIPTION.UPGRADE, { planId });
  }
}
