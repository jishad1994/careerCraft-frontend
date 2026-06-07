import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { ApiResponse } from "../../../models/api-response.model";
import { Observable } from "rxjs";
import { Invoice } from "../../../models/invoice.model";
import { COMPANY_API_ENDPOINTS } from "../../../constants/company-api-endpoints.constants";

@Injectable({
    providedIn: "root",
})
export class InvoiceService {
    private readonly _http = inject(HttpClient);


    getInvoiceBySubscription(subscriptionId: string): Observable<ApiResponse<Invoice>> {
        return this._http.get<ApiResponse<Invoice>>(
            COMPANY_API_ENDPOINTS.SUBSCRIPTION.GET_SUBSCRIPTION_INVOICE(subscriptionId),
        );
    }

    getCompanyInvoices(): Observable<ApiResponse<Invoice[]>> {
        return this._http.get<ApiResponse<Invoice[]>>(COMPANY_API_ENDPOINTS.INVOICE.GET_ALL_INVOICES);
    }

    downloadInvoicePDF(invoiceId: string) {
        return this._http.get(COMPANY_API_ENDPOINTS.INVOICE.DOWNLOAD_INVOICE(invoiceId), {
            responseType: "blob",
        });
    }

    
    viewInvoice(invoiceId: string) {
        return this._http.get(COMPANY_API_ENDPOINTS.INVOICE.VIEW_INVOICE(invoiceId), {
            responseType: "blob",
        });
    }

    /**
     * Trigger download of invoice PDF
     */
    downloadInvoice(invoiceId: string, invoiceNumber: string): void {
        this.downloadInvoicePDF(invoiceId).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `${invoiceNumber}.pdf`;
                link.click();
                window.URL.revokeObjectURL(url);
            },
            error: (error) => {
                console.error("Error downloading invoice:", error);
            },
        });
    }

    /**
     * Open invoice in new tab
     */
    // viewInvoice(invoiceId: string): void {
    //     const url = this.getInvoicePDFUrl(invoiceId);
    //     window.open(url, "_blank");
    // }
}
