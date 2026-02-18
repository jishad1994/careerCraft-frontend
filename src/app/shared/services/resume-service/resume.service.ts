import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { COMPANY_API_ENDPOINTS } from '../../../constants/company-api-endpoints.constants';
import { USER_API_ENDPOINTS } from '../../../constants/user-api-endpoints.constants';

@Injectable({
  providedIn: 'root',
})
export class ResumeService {
  constructor(private _http: HttpClient) {}

  getUserResumeByApplicationId(applicationId: string, mode: string = 'view') {
    return this._http.get(
      COMPANY_API_ENDPOINTS.APPLICATIONS.GET_RESUME(applicationId, mode),
      {
        responseType: 'blob',
      },
    );
  }

  getUserResumeByName(resumeName: string, mode: string = 'view') {
    return this._http.get(
      USER_API_ENDPOINTS.PROFILE.GET_RESUME(resumeName, mode),
      {
        responseType: 'blob',
      },
    );
  }
}
