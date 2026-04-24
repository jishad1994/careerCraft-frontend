import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  IInterview,
  InterviewFilter,
  InterviewStats,
  InterviewWithPopulated,
} from '../../../models/job-application/job-application.model';
import { ApiResponse } from '../../../models/api-response.model';
import { Observable } from 'rxjs';
import { COMPANY_API_ENDPOINTS } from '../../../constants/company-api-endpoints.constants';

@Injectable({
  providedIn: 'root',
})
export class InterviewService {
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
      COMPANY_API_ENDPOINTS.APPLICATIONS.GET_INTERVIEWS,
      {
        params,
      },
    );
  }

  /**
   * Schedule interview
   */
  scheduleInterview(
    applicationId: string,
    interviewData: Partial<IInterview>,
  ): Observable<ApiResponse<IInterview>> {
    return this._http.post<ApiResponse<IInterview>>(
      COMPANY_API_ENDPOINTS.APPLICATIONS.SCHEDULE_INTERVIEW(applicationId),
      interviewData,
    );
  }

  /**
   * Reschedule interview
   */
  rescheduleInterview(
    applicationId: string,
    interviewId: string,
    round: number,
    scheduledAt: Date,
    reason?: string,
  ): Observable<ApiResponse<IInterview>> {
    return this._http.put<ApiResponse<IInterview>>(
      COMPANY_API_ENDPOINTS.APPLICATIONS.RESCHEDULE_INTERVIEW(
        applicationId,
        interviewId,
      ),
      { scheduledAt, reason, round },
    );
  }

  /**
   * Cancel interview
   */
  cancelInterview(
    applicationId: string,
    interviewId: string,
    round: number,
    reason?: string,
  ): Observable<ApiResponse<IInterview>> {
    return this._http.put<ApiResponse<IInterview>>(
      COMPANY_API_ENDPOINTS.APPLICATIONS.CANCEL_INTERVIEW(
        applicationId,
        interviewId,
      ),
      { reason, round },
    );
  }

  /**
   * Complete interview
   */
  completeInterview(
    applicationId: string,
    interviewId: string,
    round: number,
    feedback?: string,
    rating?: number,
  ): Observable<ApiResponse<IInterview>> {
    return this._http.put<ApiResponse<IInterview>>(
      COMPANY_API_ENDPOINTS.APPLICATIONS.COMPLETE_INTERVIEW(
        applicationId,
        interviewId,
      ),
      { feedback, rating, round },
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
      COMPANY_API_ENDPOINTS.APPLICATIONS.GET_INTERVIEW_STATISTICS,
      { params },
    );
  }

  /**
   * Get upcoming interviews
   */
  getUpcomingInterviews(
    filter: Partial<InterviewFilter>,
    days = 7,
    page = 1,
    limit = 10,
  ): Observable<ApiResponse<InterviewWithPopulated[]>> {
    let params = new HttpParams()
      .set('days', days.toString())
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filter.companyId) {
      params = params.set('companyId', filter.companyId);
    }

    if (filter.jobId) {
      params = params.set('jobId', filter.jobId);
    }

    return this._http.get<ApiResponse<InterviewWithPopulated[]>>(
      COMPANY_API_ENDPOINTS.APPLICATIONS.GET_UPCOMING_INTERVIEWS,
      { params },
    );
  }

  getInterviewById(
    interviewId: string,
  ): Observable<ApiResponse<InterviewWithPopulated>> {
    return this._http.get<ApiResponse<InterviewWithPopulated>>(
      COMPANY_API_ENDPOINTS.APPLICATIONS.GET_INTERVIEW_BY_ID(interviewId),
    );
  }
  updateInterview(
    interviewId: string,
    applicationId: string,
    updateData: Partial<IInterview>,
  ): Observable<ApiResponse<InterviewWithPopulated>> {
    return this._http.post<ApiResponse<InterviewWithPopulated>>(
      COMPANY_API_ENDPOINTS.APPLICATIONS.UPDATE_INTERVIEW(
        applicationId,
        interviewId,
      ),
      { updateData },
    );
  }
}
