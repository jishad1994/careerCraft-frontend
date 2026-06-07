import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Job, JobSearchFilters } from "../../../models/job/job.model";
import { ApiResponse } from "../../../models/api-response.model";
import { Observable } from "rxjs";
import { PUBLIC_API_ENDPOINTS } from "../../../constants/public-endpoints.contants";

@Injectable({
    providedIn: "root",
})
export class PublicJobsService {
    private readonly _http = inject(HttpClient);

    getActiveJobs(filters?: JobSearchFilters): Observable<ApiResponse<Job[]>> {
        let params = new HttpParams();

        if (filters?.keyword) {
            params = params.set("keyword", filters.keyword);
        }

        if (filters?.location) {
            params = params.set("location", filters.location);
        }

        if (filters?.employmentType) {
            params = params.set("employmentType", filters.employmentType);
        }

        if (filters?.workMode) {
            params = params.set("workMode", filters.workMode);
        }

        return this._http.get<ApiResponse<Job[]>>(PUBLIC_API_ENDPOINTS.JOBS.GET_JOBS, { params });
    }

    getFeaturedJobs(): Observable<ApiResponse<Job[]>> {
        return this._http.get<ApiResponse<Job[]>>(PUBLIC_API_ENDPOINTS.JOBS.GET_FEATURED_JOBS);
    }

    searchJobs(filters: JobSearchFilters, page = 1, limit = 10): Observable<ApiResponse<Job[]>> {
        let params = new HttpParams().set("page", page.toString()).set("limit", limit.toString());

        if (filters.keyword) params = params.set("keyword", filters.keyword);
        if (filters.location) params = params.set("location", filters.location);
        if (filters.employmentType) params = params.set("employmentType", filters.employmentType);
        if (filters.workMode) params = params.set("workMode", filters.workMode);
        if (filters.minSalary) params = params.set("minSalary", filters.minSalary.toString());
        if (filters.maxSalary) params = params.set("maxSalary", filters.maxSalary.toString());
        if (filters.experienceMin !== undefined) params = params.set("experienceMin", filters.experienceMin.toString());
        if (filters.experienceMax !== undefined) params = params.set("experienceMax", filters.experienceMax.toString());
        if (filters.skills && filters.skills.length > 0) params = params.set("skills", filters.skills.join(","));

        return this._http.get<ApiResponse<Job[]>>(PUBLIC_API_ENDPOINTS.JOBS.SEARCH_JOBS, { params });
    }
    
    getJobById(jobId: string): Observable<ApiResponse<Job>> {
        return this._http.get<ApiResponse<Job>>(PUBLIC_API_ENDPOINTS.JOBS.GET_JOBS_BY_ID(jobId));
    }

    getJobBySlug(slug: string): Observable<ApiResponse<Job>> {
        return this._http.get<ApiResponse<Job>>(PUBLIC_API_ENDPOINTS.JOBS.GET_JOBS_BY_SLUG(slug));
    }
}
