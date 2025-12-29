import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '../../../models/api-response.model';
import {
  BasicCompanyUpdate,
  CompanyProfile,
} from '../../../models/company/company-profile.model';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../../constants/api-endpoints.constants';

@Injectable({
  providedIn: 'root',
})
export class CompanyProfileService {
  constructor(private _http: HttpClient) {}

  getProfile(): Observable<ApiResponse<CompanyProfile>> {
    return this._http.get<ApiResponse<CompanyProfile>>(
      API_ENDPOINTS.COMPANY.PROFILE.GET_PROFILE
    );
  }

  // Update basic profile info
  updateBasicProfile(
    data: BasicCompanyUpdate
  ): Observable<ApiResponse<CompanyProfile>> {
    return this._http.patch<ApiResponse<CompanyProfile>>(
      API_ENDPOINTS.COMPANY.PROFILE.UPDATE_PROFILE,
      data
    );
  }

  // Profile Picture APIs
  updateProfilePicture(file: File): Observable<ApiResponse<CompanyProfile>> {
    const formData = new FormData();
    formData.append('profilePicture', file);
    return this._http.post<ApiResponse<CompanyProfile>>(
      API_ENDPOINTS.COMPANY.PROFILE.UPDATE_PROFILE_PICTURE,
      formData
    );
  }

  deleteProfilePicture(): Observable<ApiResponse<CompanyProfile>> {
    return this._http.delete<ApiResponse<CompanyProfile>>(
      API_ENDPOINTS.COMPANY.PROFILE.UPDATE_PROFILE_PICTURE
    );
  }

  // Banner Image APIs
  updateBannerImage(file: File): Observable<ApiResponse<CompanyProfile>> {
    const formData = new FormData();
    formData.append('bannerImage', file);
    return this._http.post<ApiResponse<CompanyProfile>>(
      API_ENDPOINTS.COMPANY.PROFILE.UPDATE_BANNER_IMAGE,
      formData
    );
  }

  deleteBannerImage(): Observable<ApiResponse<CompanyProfile>> {
    return this._http.delete<ApiResponse<CompanyProfile>>(
      API_ENDPOINTS.COMPANY.PROFILE.UPDATE_BANNER_IMAGE
    );
  }

  // Documents APIs
  uploadDocument(file: File): Observable<ApiResponse<CompanyProfile>> {
    const formData = new FormData();
    formData.append('document', file);
    return this._http.post<ApiResponse<CompanyProfile>>(
      API_ENDPOINTS.COMPANY.PROFILE.UPLOAD_DOCUMENTS,
      formData
    );
  }

  deleteDocument(documentKey: string): Observable<ApiResponse<CompanyProfile>> {
    return this._http.delete<ApiResponse<CompanyProfile>>(
      API_ENDPOINTS.COMPANY.PROFILE.DELETE_DOCUMENT(documentKey)
    );
  }
}
