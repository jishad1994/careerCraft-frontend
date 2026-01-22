import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '../../../models/api-response.model';
import { API_ENDPOINTS } from '../../../constants/api-endpoints.constants';
import { Observable } from 'rxjs';
import {
  IJobApplication,
  JobApplicationStatusResponse,
} from '../../../models/job-application/job-application.model';

@Injectable({
  providedIn: 'root',
})
export class UserJobApplicationService {
  constructor(private _http: HttpClient) {}

  checkApplicationStatus(
    jobId: string
  ): Observable<ApiResponse<JobApplicationStatusResponse>> {
    return this._http.get<ApiResponse<JobApplicationStatusResponse>>(
      API_ENDPOINTS.USER.APPLICATION.GET_STATUS(jobId)
    );
  }

  getUserApplications(
    page: number,
    limit: number,
    status: string
  ): Observable<ApiResponse<IJobApplication[]>> {
    return this._http.get<ApiResponse<IJobApplication[]>>(
      API_ENDPOINTS.USER.APPLICATION.GET_USER_APPLICATIONS(page, limit, status)
    );
  }

  getApplicationById(id: string): Observable<ApiResponse<IJobApplication>> {
    return this._http.get<ApiResponse<IJobApplication>>(
      API_ENDPOINTS.USER.APPLICATION.GET_APPLICATION_BY_ID(id)
    );
  }

  withdrawApplication(id: string): Observable<ApiResponse<IJobApplication>> {
    return this._http.patch<ApiResponse<IJobApplication>>(
      API_ENDPOINTS.USER.APPLICATION.WITHDRAW(id),
      {}
    );
  }
}
