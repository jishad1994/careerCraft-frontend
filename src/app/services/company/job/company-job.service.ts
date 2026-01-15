import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '../../../models/api-response.model';
import { filter, Observable } from 'rxjs';
import {
  CreateJobDto,
  Job,
  JobSearchFilters,
  JobStatistics,
  UpdateJobDto,
} from '../../../models/job/job.model';
import { API_ENDPOINTS } from '../../../constants/api-endpoints.constants';
import { Skill } from '../../../models/skill.model';

@Injectable({
  providedIn: 'root',
})
export class CompanyJobService {
  constructor(private _http: HttpClient) {}

  createJob(jobData: CreateJobDto): Observable<ApiResponse<Job>> {
    return this._http.post<ApiResponse<Job>>(
      API_ENDPOINTS.COMPANY.JOBS.CREATE_JOB,
      jobData
    );
  }

  getCompanyJobs(
    page: number = 1,
    limit: number = 10,
    filters: JobSearchFilters
  ): Observable<ApiResponse<Job[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    if (filters.keyword) params = params.set('keyword', filters.keyword);
    if (filters.location) params = params.set('location', filters.location);
    if (filters.employmentType)
      params = params.set('employmentType', filters.employmentType);
    if (filters.workMode) params = params.set('workMode', filters.workMode);
    if (filters.skills && filters.skills.length > 0)
      params = params.set('skills', filters.skills.join(','));
    if (filters.status)
      params = params.set('status', filters.status.toString());
    return this._http.get<ApiResponse<Job[]>>(
      API_ENDPOINTS.COMPANY.JOBS.GET_COMPANY_JOBS,
      { params }
    );
  }

  getJobById(jobId: string): Observable<ApiResponse<Job>> {
    return this._http.get<ApiResponse<Job>>(
      API_ENDPOINTS.COMPANY.JOBS.GET_JOB_BY_ID(jobId)
    );
  }

  // Update job
  updateJob(
    jobId: string,
    updates: UpdateJobDto
  ): Observable<ApiResponse<Job>> {
    return this._http.put<ApiResponse<Job>>(
      API_ENDPOINTS.COMPANY.JOBS.UPDATE_JOB_BY_ID(jobId),
      updates
    );
  }

  // Update job status
  updateJobStatus(jobId: string, status: string): Observable<ApiResponse<Job>> {
    return this._http.patch<ApiResponse<Job>>(
      API_ENDPOINTS.COMPANY.JOBS.UPDATE_JOB_STATUS(jobId),
      {
        status,
      }
    );
  }

  // Delete job
  deleteJob(jobId: string): Observable<ApiResponse<null>> {
    return this._http.delete<ApiResponse<null>>(
      API_ENDPOINTS.COMPANY.JOBS.DELETE_JOB(jobId)
    );
  }

  searchSkills(query: string): Observable<ApiResponse<Skill[]>> {
    return this._http.get<ApiResponse<Skill[]>>(
      API_ENDPOINTS.COMPANY.JOBS.SEARCH_SKILLS(query, 1, 10)
    );
  }
  
  getJobStatistics(): Observable<ApiResponse<JobStatistics>> {
    return this._http.get<ApiResponse<JobStatistics>>(
      API_ENDPOINTS.COMPANY.JOBS.GET_JOB_STATISTICS
    );
  }
}
