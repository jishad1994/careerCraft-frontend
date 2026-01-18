import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IJobApplication } from '../../../models/job-application/job-application.model';
import { API_ENDPOINTS } from '../../../constants/api-endpoints.constants';
import { ApiResponse } from '../../../models/api-response.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CompanyApplicationService {
  constructor(private _http: HttpClient) {}

  getCompanyApplication(
    page: number,
    limit: number,
    jobId: string,
    status: string
  ): Observable<ApiResponse<IJobApplication[]>> {
    return this._http.get<ApiResponse<IJobApplication[]>>(
      API_ENDPOINTS.COMPANY.APPLICATIONS.GET_ALL(page, limit, jobId, status)
    );
  }
  getApplicationById(id: string): Observable<ApiResponse<IJobApplication>> {
    return this._http.get<ApiResponse<IJobApplication>>(
      API_ENDPOINTS.COMPANY.APPLICATIONS.GET_BY_ID(id)
    );
  }
  getApplicationsByJob(
    jobId: string,
    page: number,
    limit: number,
    status: string
  ): Observable<ApiResponse<IJobApplication[]>> {
    return this._http.get<ApiResponse<IJobApplication[]>>(
      API_ENDPOINTS.COMPANY.APPLICATIONS.GET_BY_JOB(jobId, page, limit, status)
    );
  }
  updateApplicationStatus(
    id: string,
    status: string,
    notes?: string
  ): Observable<ApiResponse<IJobApplication>> {
    return this._http.post<ApiResponse<IJobApplication>>(
      API_ENDPOINTS.COMPANY.APPLICATIONS.UPDATE_STATUS(id),
      { status, notes: notes ?? '' }
    );
  }
  markAsViewed(id: string): Observable<ApiResponse<IJobApplication>> {
    return this._http.get<ApiResponse<IJobApplication>>(
      API_ENDPOINTS.COMPANY.APPLICATIONS.MARK_AS_VIEWED(id)
    );
  }
  addNotes(
    id: string,
    notes: string
  ): Observable<ApiResponse<IJobApplication>> {
    return this._http.post<ApiResponse<IJobApplication>>(
      API_ENDPOINTS.COMPANY.APPLICATIONS.MARK_AS_VIEWED(id),
      { notes }
    );
  }
}
