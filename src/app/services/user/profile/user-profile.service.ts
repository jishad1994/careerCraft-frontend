import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Education,
  Experience,
  UserProfile,
} from '../../../models/user-profile.model';
import { API_ENDPOINTS } from '../../../constants/api-endpoints.constants';
import { ApiResponse } from '../../../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  constructor(private _http: HttpClient) {}
  getProfile(): Observable<ApiResponse<UserProfile>> {
    return this._http.get<ApiResponse<UserProfile>>(
      API_ENDPOINTS.USER.PROFILE.GET_PROFILE
    );
  }

  updateProfile(
    data: Partial<UserProfile>
  ): Observable<ApiResponse<UserProfile>> {
    return this._http.patch<ApiResponse<UserProfile>>(
      API_ENDPOINTS.USER.PROFILE.UPDATE_PROFILE,
      data
    );
  }

  updateProfilePicture(file: File): Observable<ApiResponse<UserProfile>> {
    const formData = new FormData();

    formData.append('profilePicture', file);

    return this._http.post<ApiResponse<UserProfile>>(
      API_ENDPOINTS.USER.PROFILE.UPDATE_PROFILE_PICTURE,
      formData
    );
  }

  deleteProfilePicture(): Observable<ApiResponse<UserProfile>> {
    return this._http.delete<ApiResponse<UserProfile>>(
      API_ENDPOINTS.USER.PROFILE.DELETE_PROFILE_PICTURE
    );
  }

  addUserSkill(skillId: string): Observable<ApiResponse<UserProfile>> {
    return this._http.post<ApiResponse<UserProfile>>(
      API_ENDPOINTS.USER.PROFILE.SKILLS.ADD,
      {
        skillId,
      }
    );
  }
  removeUserSkill(skillId: string): Observable<ApiResponse<UserProfile>> {
    return this._http.delete<ApiResponse<UserProfile>>(
      API_ENDPOINTS.USER.PROFILE.SKILLS.DELETE(skillId)
    );
  }

  addEducation(education: Education): Observable<ApiResponse<UserProfile>> {
    return this._http.post<ApiResponse<UserProfile>>(
      API_ENDPOINTS.USER.PROFILE.EDUCATION.ADD,
      education
    );
  }
  updateEducation(
    index: number,
    education: Education
  ): Observable<ApiResponse<UserProfile>> {
    return this._http.put<ApiResponse<UserProfile>>(
      API_ENDPOINTS.USER.PROFILE.EDUCATION.UPDATE,
      { index, education }
    );
  }

  deleteEducation(index: number): Observable<ApiResponse<UserProfile>> {
    return this._http.delete<ApiResponse<UserProfile>>(
      API_ENDPOINTS.USER.PROFILE.EDUCATION.DELETE(index)
    );
  }

  addExperience(experience: Experience): Observable<ApiResponse<UserProfile>> {
    return this._http.post<ApiResponse<UserProfile>>(
      API_ENDPOINTS.USER.PROFILE.EXPERIENCE.ADD,
      experience
    );
  }
  updateExperience(
    index: number,
    experience: Experience,
  ): Observable<ApiResponse<UserProfile>> {
    return this._http.put<ApiResponse<UserProfile>>(
      API_ENDPOINTS.USER.PROFILE.EXPERIENCE.UPDATE,
      { experience, index }
    );
  }
  deleteExperience(index: number): Observable<ApiResponse<UserProfile>> {
    return this._http.delete<ApiResponse<UserProfile>>(
      API_ENDPOINTS.USER.PROFILE.EXPERIENCE.DELETE(index)
    );
  }

  uploadCertificate(file: File): Observable<ApiResponse<UserProfile>> {
    const formData = new FormData();

    formData.append('certifcate', file);

    return this._http.post<ApiResponse<UserProfile>>(
      API_ENDPOINTS.USER.PROFILE.CERTIFICATES.ADD,
      formData
    );
  }
  deleteCertificate(documentKey: string): Observable<ApiResponse<UserProfile>> {
    return this._http.delete<ApiResponse<UserProfile>>(
      API_ENDPOINTS.USER.PROFILE.CERTIFICATES.DELETE(documentKey)
    );
  }
}
