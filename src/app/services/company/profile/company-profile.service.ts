import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ApiResponse } from '../../../models/api-response.model';
import {
  BasicCompanyUpdate,
  CompanyProfile,
  IAddress,
} from '../../../models/company/company-profile.model';
import { Observable } from 'rxjs';
import { COMPANY_API_ENDPOINTS } from '../../../constants/company-api-endpoints.constants';

@Injectable({
  providedIn: 'root',
})
export class CompanyProfileService {
  private _http = inject(HttpClient);


  getProfile(): Observable<ApiResponse<CompanyProfile>> {
    return this._http.get<ApiResponse<CompanyProfile>>(
      COMPANY_API_ENDPOINTS.PROFILE.GET_PROFILE,
    );
  }

  // Update basic profile info
  updateBasicProfile(
    data: BasicCompanyUpdate,
  ): Observable<ApiResponse<CompanyProfile>> {
    return this._http.put<ApiResponse<CompanyProfile>>(
      COMPANY_API_ENDPOINTS.PROFILE.UPDATE_PROFILE,
      data,
    );
  }
  updateAddress(
    addresses: IAddress[],
  ): Observable<ApiResponse<CompanyProfile>> {
    return this._http.put<ApiResponse<CompanyProfile>>(
      COMPANY_API_ENDPOINTS.PROFILE.UPDATE_COMPANY_ADDRESS,
      addresses,
    );
  }

  // Profile Picture APIs
  updateProfilePicture(file: File): Observable<ApiResponse<CompanyProfile>> {
    const formData = new FormData();
    formData.append('profilePicture', file);
    return this._http.post<ApiResponse<CompanyProfile>>(
      COMPANY_API_ENDPOINTS.PROFILE.UPDATE_PROFILE_PICTURE,
      formData,
    );
  }

  deleteProfilePicture(): Observable<ApiResponse<CompanyProfile>> {
    return this._http.delete<ApiResponse<CompanyProfile>>(
      COMPANY_API_ENDPOINTS.PROFILE.DELETE_PROFILE_PICTURE,
    );
  }

  // Banner Image APIs
  updateBannerImage(file: File): Observable<ApiResponse<CompanyProfile>> {
    const formData = new FormData();
    formData.append('bannerImage', file);
    return this._http.post<ApiResponse<CompanyProfile>>(
      COMPANY_API_ENDPOINTS.PROFILE.UPDATE_BANNER_IMAGE,
      formData,
    );
  }

  deleteBannerImage(): Observable<ApiResponse<CompanyProfile>> {
    return this._http.delete<ApiResponse<CompanyProfile>>(
      COMPANY_API_ENDPOINTS.PROFILE.DELETE_BANNER_IMAGE,
    );
  }

  // Documents APIs
  uploadDocument(file: File): Observable<ApiResponse<CompanyProfile>> {
    const formData = new FormData();
    formData.append('document', file);
    return this._http.post<ApiResponse<CompanyProfile>>(
      COMPANY_API_ENDPOINTS.PROFILE.UPLOAD_DOCUMENTS,
      formData,
    );
  }

  deleteDocument(documentKey: string): Observable<ApiResponse<CompanyProfile>> {
    return this._http.delete<ApiResponse<CompanyProfile>>(
      COMPANY_API_ENDPOINTS.PROFILE.DELETE_DOCUMENT(documentKey),
    );
  }

  viewDocument(documentKey: string, mode = 'view') {
    return this._http.get(
      COMPANY_API_ENDPOINTS.PROFILE.VIEW_DOCUMENT(documentKey, mode),
      {
        responseType: 'blob',
      },
    );
  }

  reapplyForVerification(): Observable<ApiResponse<CompanyProfile>> {
    return this._http.patch<ApiResponse<CompanyProfile>>(
      COMPANY_API_ENDPOINTS.PROFILE.REAPPLY_FOR_VERIFICATION,
      {},
    );
  }
}
