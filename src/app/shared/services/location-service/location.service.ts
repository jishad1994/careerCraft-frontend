import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LocationSuggestion } from '../../../models/user/user-profile.model';
import { API_ENDPOINTS } from '../../../constants/api-endpoints.constants';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  constructor(private _http: HttpClient) {}

  getLocations(query: string): Observable<LocationSuggestion[]> {
    return this._http.get<LocationSuggestion[]>(
      API_ENDPOINTS.COMMON.PUBLIC_LOCATION_API_URL(query),
    );
  }
}
