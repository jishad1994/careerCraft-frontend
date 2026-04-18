import { Injectable, inject } from "@angular/core";
import { ApiResponse } from "../../../models/api-response.model";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { COMPANY_API_ENDPOINTS } from "../../../constants/company-api-endpoints.constants";
import { IPayment } from "../../../models/payment.model";

interface PaymentIntentResponse {
    clientSecret: string;
    subscriptionId: string;
    intentId: string;
    paymentId: string;
    isQueued: boolean;
    queuePosition?: number;
    scheduledStartDate?: string;
}

interface PaymentResponse {
    paymentId: string;
    subscriptionId: string;
    invoiceId?: string;
    invoiceNumber?: string;
    status: string;
    isQueued?: boolean;
    queuePosition?: number;
    scheduledStartDate?: string;
    addonName?: string;
    addonQuantity?: number;
    addonType?: string;
}

@Injectable({
    providedIn: "root",
})
export class PaymentService {
    private readonly _http = inject(HttpClient);


    createPaymentIntent(planId: string, isUpgrade: boolean): Observable<ApiResponse<PaymentIntentResponse>> {
        return this._http.post<ApiResponse<PaymentIntentResponse>>(
            COMPANY_API_ENDPOINTS.SUBSCRIPTION.CREATE_PAYMENT_INTEND_AND_SUBSCRIBE,
            { planId, isUpgrade },
        );
    }

    confirmPayment(subscriptionId: string, paymentIntentId: string): Observable<ApiResponse<PaymentResponse>> {
        return this._http.post<ApiResponse<PaymentResponse>>(
            COMPANY_API_ENDPOINTS.SUBSCRIPTION.CONFIRM_PAYMENT_AND_ACTIVATE_SUBSCRIPTION,
            { subscriptionId, paymentIntentId },
        );
    }

    retryPayment(subscriptionId: string): Observable<ApiResponse<PaymentIntentResponse>> {
        return this._http.post<ApiResponse<PaymentIntentResponse>>(COMPANY_API_ENDPOINTS.SUBSCRIPTION.RETRY_PAYMENT, {
            subscriptionId,
        });
    }

    purchaseAddon(addonId: string): Observable<ApiResponse<PaymentIntentResponse>> {
        return this._http.get<ApiResponse<PaymentIntentResponse>>(COMPANY_API_ENDPOINTS.ADDONS.PURCHASE_ADDON(addonId));
    }

    confirmAddon(paymentId: string, paymentIntentId: string): Observable<ApiResponse<PaymentResponse>> {
        return this._http.post<ApiResponse<PaymentResponse>>(COMPANY_API_ENDPOINTS.ADDONS.CONFIRM_ADDON, {
            paymentId,
            paymentIntentId,
        });
    }

    getPayment(paymentId: string): Observable<ApiResponse<IPayment>> {
        return this._http.get<ApiResponse<IPayment>>(COMPANY_API_ENDPOINTS.SUBSCRIPTION.GET_PAYMENT(paymentId)); //use case not yet
    }
}
