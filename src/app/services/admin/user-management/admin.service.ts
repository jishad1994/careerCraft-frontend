import { HttpClient } from '@angular/common/http';
import { Injectable, Query, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../models/api-response.model';
import {
  CompanyProfile,
  CompanyVerificationStatus,
  ICompanyListItem,
} from '../../../models/company/company-profile.model';
import {
  IUserListItem,
  UserProfile,
} from '../../../models/user/user-profile.model';
import { ADMIN_API_END_POINTS } from '../../../constants/admin-endpoints.constants';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private _http = inject(HttpClient);


  getUsers(
    page = 1,
    limit = 10,
    query?: string,
  ): Observable<ApiResponse<IUserListItem[]>> {
    return this._http.get<ApiResponse<IUserListItem[]>>(
      ADMIN_API_END_POINTS.USER_MANAGEMENT.GET_USERS(page, limit, query),
    );
  }

  getUserById(id: string): Observable<ApiResponse<UserProfile>> {
    return this._http.get<ApiResponse<UserProfile>>(
      ADMIN_API_END_POINTS.USER_MANAGEMENT.GET_USER_BY_ID(id),
    );
  }

  getCompanies(
    page = 1,
    limit = 10,
    query?: string,
    verificationStatus?: string,
  ): Observable<ApiResponse<ICompanyListItem[]>> {
    return this._http.get<ApiResponse<ICompanyListItem[]>>(
      ADMIN_API_END_POINTS.USER_MANAGEMENT.GET_COMPANIES(page, limit, query, verificationStatus),
    );
  }

  getCompanyById(id: string): Observable<ApiResponse<CompanyProfile>> {
    return this._http.get<ApiResponse<CompanyProfile>>(
      ADMIN_API_END_POINTS.USER_MANAGEMENT.GET_COMPANY_BY_ID(id),
    );
  }

  verifyCompany(id: string): Observable<ApiResponse<CompanyProfile>> {
    return this._http.patch<ApiResponse<CompanyProfile>>(
      ADMIN_API_END_POINTS.USER_MANAGEMENT.VERIFY_COMPANY(id),
      {},
    );
  }

  rejectCompanyVerification(
    id: string,
    code: string,
    description?: string,
  ): Observable<ApiResponse<void>> {
    return this._http.post<ApiResponse<void>>(
      ADMIN_API_END_POINTS.USER_MANAGEMENT.REJECT_COMPANY_VERIFICATION(id),
      { code, description },
    );
  }

  getDocumentSignedUrl(
    documentKey: string,
  ): Observable<ApiResponse<{ url: string }>> {
    return this._http.post<ApiResponse<{ url: string }>>(
      ADMIN_API_END_POINTS.USER_MANAGEMENT.GET_COMPANY_DOCUMENT_URL,
      { documentKey },
    );
  }

  blockOrUnblockCompany(
    id: string,
    flag: boolean,
  ): Observable<ApiResponse<ICompanyListItem>> {
    const action = flag ? 'block' : 'unblock';
    return this._http.patch<ApiResponse<ICompanyListItem>>(
      ADMIN_API_END_POINTS.USER_MANAGEMENT.BLOCK_OR_UNBLOCK_COMPANY(id, action),
      {},
    );
  }

  blockOrUnblockUser(
    id: string,
    flag: boolean,
  ): Observable<ApiResponse<IUserListItem>> {
    const action = flag ? 'block' : 'unblock';
    return this._http.patch<ApiResponse<IUserListItem>>(
      ADMIN_API_END_POINTS.USER_MANAGEMENT.BLOCK_OR_UNBLOCK_USER(id, action),
      {},
    );
  }

  blockUserWithComment(
    id: string,
    comment: string,
  ): Observable<ApiResponse<UserProfile>> {
    return this._http.post<ApiResponse<UserProfile>>(
      ADMIN_API_END_POINTS.USER_MANAGEMENT.BLOCK_USER_WITH_COMMENT(id),
      { comment },
    );
  }
}
