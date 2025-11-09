import { HttpClient } from '@angular/common/http';
import { Injectable, Query } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../constants/api-endpoints.constants';

@Injectable({
  providedIn: 'root',
})
export class AdminService {

  constructor(private _http: HttpClient) {}

  getUsersPaginated(page: number, limit: number = 5): Observable<any> {
    return this._http.get(API_ENDPOINTS.ADMIN.GET_USERS_PAGINATED(page, limit));
  }

  getUsers(query: string): Observable<any> {
    return this._http.get(API_ENDPOINTS.ADMIN.GET_USERS(query));
  }

  getCompaniesPaginated(page: number, limit: number = 5): Observable<any> {
    return this._http.get(
      API_ENDPOINTS.ADMIN.GET_COMPANIES_PAGINATED(page, limit)
    );
  }

  getCompanies(query: string): Observable<any> {
    return this._http.get(API_ENDPOINTS.ADMIN.GET_COMPANIES(query));
  }
  /**
   * 
   * @param id 
   * @param flag 
   * @returns 
   */
  blockOrUnblockCompany(id: string, flag: boolean): Observable<any> {
    const action = flag ? 'block' : 'unblock';
    return this._http.patch(
      API_ENDPOINTS.ADMIN.BLOCK_OR_UNBLOCK_COMPANY(id, action),
      {}
    );
  }

  blockOrUnblockUser(id: string, flag: boolean): Observable<any> {
    const action = flag ? 'block' : 'unblock';
    return this._http.patch(
      API_ENDPOINTS.ADMIN.BLOCK_OR_UNBLOCK_USER(id, action),
      {}
    );
  }
}
