import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  InterviewFilter,
  InterviewStats,
  InterviewWithPopulated,
} from '../../../models/job-application/job-application.model';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../models/api-response.model';
import { USER_API_ENDPOINTS } from '../../../constants/user-api-endpoints.constants';

@Injectable({
  providedIn: 'root',
})
export class CandidateInterviewService {
  private _http = inject(HttpClient);


  /**
   * Get interviews with full context by filters if present
   */
  getAllInterviews(
    filter: InterviewFilter,
    page = 1,
    limit = 10,
  ): Observable<ApiResponse<InterviewWithPopulated[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filter.companyId) {
      params = params.set('companyId', filter.companyId);
    }

    if (filter.jobId) {
      params = params.set('jobId', filter.jobId);
    }

    if (filter.applicationId) {
      params = params.set('applicationId', filter.applicationId);
    }

    if (filter.status && filter.status.length > 0) {
      params = params.set('status', filter.status.join(','));
    }

    if (filter.type && filter.type.length > 0) {
      params = params.set('type', filter.type.join(','));
    }

    if (filter.round) {
      params = params.set('round', filter.round.toString());
    }

    if (filter.startDate) {
      params = params.set('startDate', filter.startDate.toISOString());
    }

    if (filter.endDate) {
      params = params.set('endDate', filter.endDate.toISOString());
    }

    if (filter.search) {
      params = params.set('search', filter.search);
    }

    return this._http.get<ApiResponse<InterviewWithPopulated[]>>(
      USER_API_ENDPOINTS.APPLICATION.GET_INTERVIEWS,
      {
        params,
      },
    );
  }

  /**
   * Get interview statistics
   */
  getInterviewStats(
    filter: Partial<InterviewFilter>,
  ): Observable<ApiResponse<InterviewStats>> {
    let params = new HttpParams();

    if (filter.companyId) {
      params = params.set('companyId', filter.companyId);
    }

    if (filter.jobId) {
      params = params.set('jobId', filter.jobId);
    }

    if (filter.applicationId) {
      params = params.set('applicationId', filter.applicationId);
    }

    return this._http.get<ApiResponse<InterviewStats>>(
      USER_API_ENDPOINTS.APPLICATION.GET_INTERVIEW_STATS,
      { params },
    );
  }

  getInterviewById(
    interviewId: string,
  ): Observable<ApiResponse<InterviewWithPopulated>> {
    return this._http.get<ApiResponse<InterviewWithPopulated>>(
      USER_API_ENDPOINTS.APPLICATION.GET_INTERVIEW_BY_ID(interviewId),
    );
  }
}
