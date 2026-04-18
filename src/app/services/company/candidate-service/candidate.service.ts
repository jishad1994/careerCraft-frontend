import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../models/api-response.model';
import { UserProfile } from '../../../models/user/user-profile.model';
import { COMPANY_API_ENDPOINTS } from '../../../constants/company-api-endpoints.constants';

@Injectable({
  providedIn: 'root',
})
export class CandidateService {
  private readonly _http = inject(HttpClient);


  getCandiateProfile(
    candidateId: string,
  ): Observable<ApiResponse<UserProfile>> {
    return this._http.get<ApiResponse<UserProfile>>(
      COMPANY_API_ENDPOINTS.CANDIDATES.getCandidateProfile(candidateId),
    );
  }
}
