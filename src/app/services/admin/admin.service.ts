import { HttpClient } from '@angular/common/http';
import { Injectable, Query } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private baseUrl = environment.apiUrl;

  constructor(private _http: HttpClient) {}

  getUsersPaginated(page: number, limit: number = 5): Observable<any> {
    return this._http.get(
      `${this.baseUrl}/api/admin/getUsersPaginated?page=${page}&limit=${limit}`
    );
  }

  getUsers(query: string): Observable<any> {
    return this._http.get(`${this.baseUrl}/api/admin/getUsers?search=${query}`);
  }
  getCompaniesPaginated(page: number, limit: number = 5): Observable<any> {
    return this._http.get(
      `${this.baseUrl}/api/admin/getCompaniesPaginated?page=${page}&limit=${limit}`
    );
  }
  getCompanies(query: string): Observable<any> {
    return this._http.get(
      `${this.baseUrl}/api/admin/getCompanies?search=${query}`
    );
  }
  blockOrUnblockCompany(id: string, flag: boolean): Observable<any> {
    const action = flag ? 'block' : 'unblock';
    return this._http.patch(
      `${this.baseUrl}/api/admin/companies/${id}/${action}`,
      {}
    );
  }

  blockOrUnblockUser(id: string, flag: boolean): Observable<any> {
    const action = flag ? 'block' : 'unblock';
    return this._http.patch(
      `${this.baseUrl}/api/admin/users/${id}/${action}`,
      {}
    );
  }
}
