import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

import { environment } from "../../../environments/environment";
import { ApiResponse } from "../../../models/api-response.model";
import {
    ProfileDataResponse,
    ResumeData,
    ResumeTemplate,
    SavedResumeResponse,
} from "../../../models/user/user-resume.model";
import { USER_API_ENDPOINTS } from "../../../constants/user-api-endpoints.constants";

@Injectable({ providedIn: "root" })
export class ResumeBuilderService {
    private readonly baseUrl = `${environment.apiUrl}/resume-builder`;

    constructor(private readonly http: HttpClient) {}

    getTemplates(): Observable<ApiResponse<ResumeTemplate[]>> {
        return this.http.get<ApiResponse<ResumeTemplate[]>>(USER_API_ENDPOINTS.RESUME_BULDER.GET_TEMPLATES);
    }

    getDraft(): Observable<ApiResponse<SavedResumeResponse | null>> {
        return this.http.get<ApiResponse<SavedResumeResponse | null>>(USER_API_ENDPOINTS.RESUME_BULDER.GET_DRAFT);
    }

    saveDraft(resumeData: ResumeData): Observable<ApiResponse<SavedResumeResponse>> {
        return this.http.put<ApiResponse<SavedResumeResponse>>(USER_API_ENDPOINTS.RESUME_BULDER.SAVE_DRAFT, { resumeData });
    }

    getProfileData(): Observable<ApiResponse<ProfileDataResponse>> {
        return this.http.get<ApiResponse<ProfileDataResponse>>(USER_API_ENDPOINTS.RESUME_BULDER.GET_PROFILE_DATA);
    }

    generatePdf(resumeData: ResumeData): Observable<Blob> {
        return this.http.post(USER_API_ENDPOINTS.RESUME_BULDER.GENERATE_PDF, { resumeData }, { responseType: "blob" });
    }

    uploadResume(resumeData: ResumeData): Observable<ApiResponse<{ documentKey: string; signedURL?: string }>> {
        return this.http.post<ApiResponse<{ documentKey: string; signedURL?: string }>>(
            USER_API_ENDPOINTS.RESUME_BULDER.UPLOAD_RESUME,
            {
                resumeData,
            },
        );
    }
}
