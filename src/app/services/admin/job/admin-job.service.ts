import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../models/api-response.model';
import { Job } from '../../../models/job/job.model';
import { IJobApplication } from '../../../models/job-application/job-application.model';
import { ADMIN_API_END_POINTS } from '../../../constants/admin-endpoints.constants';

@Injectable({
  providedIn: 'root',
})
export class AdminJobService {
  private _http = inject(HttpClient);


  getAllJobs(
    page = 1,
    limit = 10,
    status?: string,
    isVerified?: boolean,
  ): Observable<ApiResponse<Job[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) params = params.set('status', status);
    if (isVerified !== undefined)
      params = params.set('isVerified', isVerified.toString());

    return this._http.get<ApiResponse<Job[]>>(
      ADMIN_API_END_POINTS.JOB.GET_ALL_JOBS,
      { params },
    );
  }

  getJobById(id: string): Observable<ApiResponse<Job>> {
    return this._http.get<ApiResponse<Job>>(
      ADMIN_API_END_POINTS.JOB.GET_JOB_BY_ID(id),
    );
  }

  verifyJob(jobId: string): Observable<ApiResponse<Job>> {
    return this._http.patch<ApiResponse<Job>>(
      ADMIN_API_END_POINTS.JOB.VERIFY_JOB(jobId),
      {},
    );
  }

  // Block job
  blockJob(jobId: string): Observable<ApiResponse<Job>> {
    return this._http.patch<ApiResponse<Job>>(
      ADMIN_API_END_POINTS.JOB.BLOCK_JOB(jobId),
      {},
    );
  }

  // Unblock job
  unblockJob(jobId: string): Observable<ApiResponse<Job>> {
    return this._http.patch<ApiResponse<Job>>(
      ADMIN_API_END_POINTS.JOB.UNBLOCK_JOB(jobId),
      {},
    );
  }

  // Delete job
  deleteJob(jobId: string): Observable<ApiResponse<null>> {
    return this._http.delete<ApiResponse<null>>(
      ADMIN_API_END_POINTS.JOB.DELETE_JOB(jobId),
    );
  }

  getApplicationsByJob(
    jobId: string,
    page: number,
    limit: number,
  ): Observable<ApiResponse<IJobApplication[]>> {
    return this._http.get<ApiResponse<IJobApplication[]>>(
      ADMIN_API_END_POINTS.JOB.GET_APPLICATIONS_BY_JOB(jobId, page, limit),
    );
  }
}
