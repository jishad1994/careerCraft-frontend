import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { ApiResponse } from "../../../models/api-response.model";
import {
    CompanySubscription,
    IQueuedSubscriptionDTO,
    RemainingLimits,
} from "../../../models/company/company-subscription.model";
import { COMPANY_API_ENDPOINTS } from "../../../constants/company-api-endpoints.constants";
import { ISubscriptionPlan } from "../../../models/subscription-plan/subscription-plan.model";
import {  ISubscriptionAddonWithUsage } from "../../../models/subscription-addons.model";
export interface CancellationResult {
    success: boolean;
    message: string;
    cancelledSubscriptionId: string;
    activatedSubscriptionId?: string;
    queueReordered: boolean;
    remainingQueue: number;
}
@Injectable({
    providedIn: "root",
})
export class CompanySubscriptionService {
    private readonly _http = inject(HttpClient);


    getActiveSubscription(): Observable<ApiResponse<CompanySubscription>> {
        return this._http.get<ApiResponse<CompanySubscription>>(COMPANY_API_ENDPOINTS.SUBSCRIPTION.GET_ACTIVE_SUBSCRIPTION);
    }

    getQueue(): Observable<ApiResponse<{ active: CompanySubscription; queued: IQueuedSubscriptionDTO[] }>> {
        return this._http.get<ApiResponse<{ active: CompanySubscription; queued: IQueuedSubscriptionDTO[] }>>(
            COMPANY_API_ENDPOINTS.SUBSCRIPTION.GET_QUEUE,
        );
    }

    getPlans(): Observable<ApiResponse<ISubscriptionPlan[]>> {
        return this._http.get<ApiResponse<ISubscriptionPlan[]>>(COMPANY_API_ENDPOINTS.SUBSCRIPTION.GET_ALL_ACTIVE_PLANS);
    }
    getAvailableAddons(): Observable<ApiResponse<ISubscriptionAddonWithUsage[]>> {
        return this._http.get<ApiResponse<ISubscriptionAddonWithUsage[]>>(
            COMPANY_API_ENDPOINTS.ADDONS.GET_ALL_AVAILABLE_ADDONS,
        );
    }

    getPlanById(planId: string): Observable<ApiResponse<ISubscriptionPlan>> {
        return this._http.get<ApiResponse<ISubscriptionPlan>>(COMPANY_API_ENDPOINTS.SUBSCRIPTION.GET_PLAN_BY_ID(planId));
    }

    getRemainingLimits(): Observable<ApiResponse<RemainingLimits>> {
        return this._http.get<ApiResponse<RemainingLimits>>(
            COMPANY_API_ENDPOINTS.SUBSCRIPTION.GET_REMAINING_SUBSCRIPTION_LIMITS,
        );
    }

    cancelSubscription(reason: string): Observable<ApiResponse<CancellationResult>> {
        return this._http.post<ApiResponse<CancellationResult>>(COMPANY_API_ENDPOINTS.SUBSCRIPTION.CANCEL_SUSBCRIPTION, {
            reason,
        });
    }

    upgradeSubscription(
        planId: string,
    ): Observable<ApiResponse<{ subscription: CompanySubscription; paymentUrl: string }>> {
        return this._http.post<ApiResponse<{ subscription: CompanySubscription; paymentUrl: string }>>(
            COMPANY_API_ENDPOINTS.SUBSCRIPTION.UPGRADE,
            { planId },
        );
    }
}
