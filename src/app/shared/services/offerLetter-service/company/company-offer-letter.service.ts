import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { ApiResponse } from "../../../../models/api-response.model";
import { CreateOfferDto, OfferLetter } from "../../../../models/offerLetter.model";
import { Observable } from "rxjs";
import { COMPANY_API_ENDPOINTS } from "../../../../constants/company-api-endpoints.constants";

@Injectable({
    providedIn: "root",
})
export class CompanyOfferLetterService {
    private readonly http = inject(HttpClient);


    createOffer(dto: CreateOfferDto): Observable<ApiResponse<OfferLetter>> {
        return this.http.post<ApiResponse<OfferLetter>>(COMPANY_API_ENDPOINTS.OFFERS.CREATE_OFFER, dto);
    }

    listOffers(page = 1, limit = 10, status?: string): Observable<ApiResponse<OfferLetter[]>> {
        let params = new HttpParams().set("page", page.toString()).set("limit", limit.toString());
        if (status) params = params.set("status", status);

        return this.http.get<ApiResponse<OfferLetter[]>>(COMPANY_API_ENDPOINTS.OFFERS.LIST_OFFERS, { params });
    }

    getOffer(id: string): Observable<ApiResponse<OfferLetter>> {
        return this.http.get<ApiResponse<OfferLetter>>(COMPANY_API_ENDPOINTS.OFFERS.GET_OFFER(id));
    }

    verifyOffer(id: string): Observable<ApiResponse<OfferLetter>> {
        return this.http.patch<ApiResponse<OfferLetter>>(COMPANY_API_ENDPOINTS.OFFERS.VERIFY_OFFERLETTER(id), {});
    }

    downloadPdf(id: string): Observable<Blob> {
        return this.http.get(COMPANY_API_ENDPOINTS.OFFERS.DOWNLOAD_OFFERLETTER(id), {
            responseType: "blob",
        });
    }

    getSignedDocumentUrl(id: string): Observable<ApiResponse<{ url: string }>> {
        return this.http.get<ApiResponse<{ url: string }>>(COMPANY_API_ENDPOINTS.OFFERS.GET_SIGNED_OFFERLETTER(id));
    }
}
