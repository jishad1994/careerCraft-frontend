import { HttpClient } from '@angular/common/http';
import { Injectable, Query } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../constants/api-endpoints.constants';
import { ApiResponse } from '../../models/api-response.model';
import {
  CompanyProfile,
  ICompanyListItem,
} from '../../models/company/company-profile.model';
import {
  IUserListItem,
  UserProfile,
} from '../../models/user/user-profile.model';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(private _http: HttpClient) {}

  getUsers(
    page: number = 1,
    limit: number = 10,
    query?: string
  ): Observable<ApiResponse<IUserListItem[]>> {
    return this._http.get<ApiResponse<IUserListItem[]>>(
      API_ENDPOINTS.ADMIN.GET_USERS(page, limit, query)
    );
  }

  getCompanies(
    page: number = 1,
    limit: number = 10,
    query?: string
  ): Observable<ApiResponse<ICompanyListItem[]>> {
    return this._http.get<ApiResponse<ICompanyListItem[]>>(
      API_ENDPOINTS.ADMIN.GET_COMPANIES(page, limit, query)
    );
  }

  getCompanyById(id: string): Observable<ApiResponse<CompanyProfile>> {
    return this._http.get<ApiResponse<CompanyProfile>>(
      API_ENDPOINTS.ADMIN.GET_COMPANY_BY_ID(id)
    );
  }

  verifyCompany(id: string): Observable<ApiResponse<CompanyProfile>> {
    return this._http.patch<ApiResponse<CompanyProfile>>(
      API_ENDPOINTS.ADMIN.VERIFY_COMPANY(id),
      {}
    );
  }

  rejectCompanyVerification(
    id: string,
    comment: string
  ): Observable<ApiResponse<void>> {
    return this._http.post<ApiResponse<void>>(
      API_ENDPOINTS.ADMIN.REJECT_COMPANY_VERIFICATION(id),
      { comment }
    );
  }

  getDocumentSignedUrl(
    documentKey: string
  ): Observable<ApiResponse<{ url: string }>> {
    return this._http.post<ApiResponse<{ url: string }>>(
      API_ENDPOINTS.ADMIN.GET_COMPANY_DOCUMENT_URL,
      { documentKey }
    );
  }

  blockOrUnblockCompany(
    id: string,
    flag: boolean
  ): Observable<ApiResponse<ICompanyListItem>> {
    const action = flag ? 'block' : 'unblock';
    return this._http.patch<ApiResponse<ICompanyListItem>>(
      API_ENDPOINTS.ADMIN.BLOCK_OR_UNBLOCK_COMPANY(id, action),
      {}
    );
  }

  blockOrUnblockUser(
    id: string,
    flag: boolean
  ): Observable<ApiResponse<IUserListItem>> {
    const action = flag ? 'block' : 'unblock';
    return this._http.patch<ApiResponse<IUserListItem>>(
      API_ENDPOINTS.ADMIN.BLOCK_OR_UNBLOCK_USER(id, action),
      {}
    );
  }
}
