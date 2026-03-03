import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../models/api-response.model';
import { UserProfile } from '../../../models/user/user-profile.model';
import { COMPANY_API_ENDPOINTS } from '../../../constants/company-api-endpoints.constants';

@Injectable({
  providedIn: 'root',
})
export class CandidateService {
  constructor(private readonly _http: HttpClient) {}

  getCandiateProfile(
    candidateId: string,
  ): Observable<ApiResponse<UserProfile>> {
    return this._http.get<ApiResponse<UserProfile>>(
      COMPANY_API_ENDPOINTS.CANDIDATES.getCandidateProfile(candidateId),
    );
  }
}
