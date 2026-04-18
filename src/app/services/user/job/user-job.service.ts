import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Job, JobSearchFilters } from '../../../models/job/job.model';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../models/api-response.model';
import { API_ENDPOINTS } from '../../../constants/api-endpoints.constants';
import { Skill } from '../../../models/skill.model';
import { IJobApplication } from '../../../models/job-application/job-application.model';
import { USER_API_ENDPOINTS } from '../../../constants/user-api-endpoints.constants';

@Injectable({
  providedIn: 'root',
})
export class UserJobService {
  private _http = inject(HttpClient);


  // Search jobs with filters
  searchJobs(
    filters: JobSearchFilters,
    page = 1,
    limit = 10
  ): Observable<ApiResponse<Job[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters.keyword) params = params.set('keyword', filters.keyword);
    if (filters.location) params = params.set('location', filters.location);
    if (filters.employmentType)
      params = params.set('employmentType', filters.employmentType);
    if (filters.workMode) params = params.set('workMode', filters.workMode);
    if (filters.minSalary)
      params = params.set('minSalary', filters.minSalary.toString());
    if (filters.maxSalary)
      params = params.set('maxSalary', filters.maxSalary.toString());
    if (filters.experienceMin !== undefined)
      params = params.set('experienceMin', filters.experienceMin.toString());
    if (filters.experienceMax !== undefined)
      params = params.set('experienceMax', filters.experienceMax.toString());
    if (filters.skills && filters.skills.length > 0)
      params = params.set('skills', filters.skills.join(','));

    return this._http.get<ApiResponse<Job[]>>(
      USER_API_ENDPOINTS.JOB.SEARCH_JOBS,
      { params }
    );
  }

  getJobById(jobId: string): Observable<ApiResponse<Job>> {
    return this._http.get<ApiResponse<Job>>(
     USER_API_ENDPOINTS.JOB.GET_JOB_BY_ID(jobId)
    );
  }

  getJobBySlug(slug: string): Observable<ApiResponse<Job>> {
    return this._http.get<ApiResponse<Job>>(
      USER_API_ENDPOINTS.JOB.GET_JOB_BY_SLUG(slug)
    );
  }

  applyForJob(jobData: FormData): Observable<ApiResponse<any>> {
    return this._http.post<ApiResponse<any>>(
      USER_API_ENDPOINTS.JOB.APPLY_FOR_JOB,
      jobData
    );
  }

  
  
}
