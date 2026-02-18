import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ICandidateListItem,
  IJobApplication,
} from '../../../models/job-application/job-application.model';
import { API_ENDPOINTS } from '../../../constants/api-endpoints.constants';
import { ApiResponse } from '../../../models/api-response.model';
import { Observable } from 'rxjs';
import { COMPANY_API_ENDPOINTS } from '../../../constants/company-api-endpoints.constants';

interface CandidateFilters {
  status: string[];
  skills: string[];
  experience: string[];
  education: string[];
  availability: string[];
  dateRange: string;
  startDate?: string;
  endDate?: string;
  jobId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CompanyApplicationService {
  constructor(private _http: HttpClient) {}

  getApplicants(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    filters: CandidateFilters,
  ): Observable<ApiResponse<ICandidateListItem[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    // Add filters
    if (filters.status.length > 0) {
      params = params.set('status', filters.status.join(','));
    }
    if (filters.skills.length > 0) {
      params = params.set('skills', filters.skills.join(','));
    }
    if (filters.experience.length > 0) {
      params = params.set('experience', filters.experience.join(','));
    }
    if (filters.education.length > 0) {
      params = params.set('education', filters.education.join(','));
    }
    if (filters.availability.length > 0) {
      params = params.set('availability', filters.availability.join(','));
    }
    if (filters.dateRange) {
      params = params.set('dateRange', filters.dateRange);
      if (filters.dateRange === 'custom') {
        if (filters.startDate) {
          params = params.set('startDate', filters.startDate);
        }
        if (filters.endDate) {
          params = params.set('endDate', filters.endDate);
        }
      }
    }
    if (filters.jobId) {
      params = params.set('jobId', filters.jobId);
    }

    return this._http.get<ApiResponse<any[]>>(
      COMPANY_API_ENDPOINTS.APPLICATIONS.GET_APPLICANTS,
      {
        params,
      },
    );
  }

  getApplicationById(id: string): Observable<ApiResponse<IJobApplication>> {
    return this._http.get<ApiResponse<IJobApplication>>(
      COMPANY_API_ENDPOINTS.APPLICATIONS.GET_BY_ID(id),
    );
  }
  getApplicationsByJob(
    jobId: string,
    page: number,
    limit: number,
    status: string,
  ): Observable<ApiResponse<IJobApplication[]>> {
    return this._http.get<ApiResponse<IJobApplication[]>>(
      COMPANY_API_ENDPOINTS.APPLICATIONS.GET_BY_JOB(jobId, page, limit, status),
    );
  }
  updateApplicationStatus(
    id: string,
    status: string,
    notes?: string,
  ): Observable<ApiResponse<IJobApplication>> {
    return this._http.post<ApiResponse<IJobApplication>>(
      COMPANY_API_ENDPOINTS.APPLICATIONS.UPDATE_STATUS(id),
      { status, notes: notes ?? '' },
    );
  }
  markAsViewed(id: string): Observable<ApiResponse<IJobApplication>> {
    return this._http.get<ApiResponse<IJobApplication>>(
      COMPANY_API_ENDPOINTS.APPLICATIONS.MARK_AS_VIEWED(id),
    );
  }
  addNotes(
    id: string,
    notes: string,
  ): Observable<ApiResponse<IJobApplication>> {
    return this._http.post<ApiResponse<IJobApplication>>(
      COMPANY_API_ENDPOINTS.APPLICATIONS.ADD_NOTES(id),
      { notes },
    );
  }

  toggleFlag(
    applicationId: string,
    isStarred: boolean,
  ): Observable<ApiResponse<IJobApplication>> {
    return this._http.patch<ApiResponse<IJobApplication>>(
      COMPANY_API_ENDPOINTS.APPLICATIONS.TOGGLE_FLAG(applicationId),
      { isStarred },
    );
  }
}
