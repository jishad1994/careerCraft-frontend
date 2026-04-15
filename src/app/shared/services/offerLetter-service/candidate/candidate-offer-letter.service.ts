import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiResponse } from "../../../../models/api-response.model";
import { OfferLetter, RespondDto } from "../../../../models/offerLetter.model";
import { Observable } from "rxjs";
import { USER_API_ENDPOINTS } from "../../../../constants/user-api-endpoints.constants";

@Injectable({
    providedIn: "root",
})
export class CandidateOfferLetterService {
    constructor(private readonly http: HttpClient) {}

    listOffers(page: number = 1, limit: number = 10, status?: string): Observable<ApiResponse<OfferLetter[]>> {
        let params = new HttpParams().set("page", page.toString()).set("limit", limit.toString());
        if (status) params = params.set("status", status);

        return this.http.get<ApiResponse<OfferLetter[]>>(USER_API_ENDPOINTS.OFFERS.LIST_OFFERS, { params });
    }

    getOffer(id: string): Observable<ApiResponse<OfferLetter>> {
        return this.http.get<ApiResponse<OfferLetter>>(USER_API_ENDPOINTS.OFFERS.GET_OFFER(id));
    }

    respondToOffer(id: string, dto: RespondDto): Observable<ApiResponse<OfferLetter>> {
        return this.http.patch<ApiResponse<OfferLetter>>(USER_API_ENDPOINTS.OFFERS.RESPOND_TO_OFFER(id), dto);
    }

    uploadSignedDocument(id: string, file: File): Observable<ApiResponse<OfferLetter>> {
        const formData = new FormData();
        formData.append("offerLetter", file);
        return this.http.post<ApiResponse<OfferLetter>>(USER_API_ENDPOINTS.OFFERS.UPLOAD_SIGNED_OFFERLETTER(id), formData);
    }

    downloadPdf(id: string): Observable<Blob> {
        return this.http.get(USER_API_ENDPOINTS.OFFERS.DOWNLOAD_PDF(id), {
            responseType: "blob",
        });
    }
}
