import { Injectable } from '@angular/core';
import { ApiResponse } from '../../../models/api-response.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { COMPANY_API_ENDPOINTS } from '../../../constants/company-api-endpoints.constants';

interface PaymentIntentResponse {
  clientSecret: string;
  subscriptionId: string;
}

interface PaymentResponse {
  paymentId: string;
  subscriptionId: string;
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  constructor(private readonly _http: HttpClient) {}

  /**
   * Create payment intent for subscription
   */
  createPaymentIntent(
    planId: string,
    isUpgrade: boolean,
  ): Observable<ApiResponse<PaymentIntentResponse>> {
    return this._http.post<ApiResponse<PaymentIntentResponse>>(
      COMPANY_API_ENDPOINTS.SUBSCRIPTION.CREATE_PAYMENT_INTEND_AND_SUBSCRIBE,
      { planId, isUpgrade },
    );
  }

  /**
   * Confirm payment after Stripe confirmation
   */
  confirmPayment(
    subscriptionId: string,
    paymentIntentId: string,
  ): Observable<ApiResponse<PaymentResponse>> {
    return this._http.post<ApiResponse<PaymentResponse>>(
      COMPANY_API_ENDPOINTS.SUBSCRIPTION
        .CONFIRM_PAYMENT_AND_ACTIVATE_SUBSCRIPTION,
      { subscriptionId, paymentIntentId },
    );
  }

  /**
   * Retry failed payment
   */
  retryPayment(
    subscriptionId: string,
  ): Observable<ApiResponse<PaymentIntentResponse>> {
    return this._http.post<ApiResponse<PaymentIntentResponse>>(
      COMPANY_API_ENDPOINTS.SUBSCRIPTION.RETRY_PAYMENT,
      { subscriptionId },
    );
  }

  /**
   * Get payment by ID
   */
  getPayment(paymentId: string): Observable<ApiResponse<unknown>> {
    return this._http.get<ApiResponse<unknown>>(`${paymentId}`);  //use case not yet
  }
}
