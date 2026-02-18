import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Education,
  Experience,
  UserProfile,
} from '../../../models/user/user-profile.model';
import { API_ENDPOINTS } from '../../../constants/api-endpoints.constants';
import { ApiResponse } from '../../../models/api-response.model';
import { USER_API_ENDPOINTS } from '../../../constants/user-api-endpoints.constants';

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  constructor(private _http: HttpClient) {}
  getProfile(): Observable<ApiResponse<UserProfile>> {
    return this._http.get<ApiResponse<UserProfile>>(
      USER_API_ENDPOINTS.PROFILE.GET_PROFILE,
    );
  }

  updateProfile(
    data: Partial<UserProfile>,
  ): Observable<ApiResponse<UserProfile>> {
    return this._http.patch<ApiResponse<UserProfile>>(
      USER_API_ENDPOINTS.PROFILE.UPDATE_PROFILE,
      data,
    );
  }

  updateProfilePicture(file: File): Observable<ApiResponse<UserProfile>> {
    const formData = new FormData();

    formData.append('profilePicture', file);

    return this._http.post<ApiResponse<UserProfile>>(
      USER_API_ENDPOINTS.PROFILE.UPDATE_PROFILE_PICTURE,
      formData,
    );
  }

  updateBannerImage(file: File): Observable<ApiResponse<UserProfile>> {
    const formData = new FormData();

    formData.append('bannerImage', file);

    return this._http.post<ApiResponse<UserProfile>>(
      USER_API_ENDPOINTS.PROFILE.UPDATE_BANNER_IMAGE,
      formData,
    );
  }
  

  deleteBannerImage(): Observable<ApiResponse<UserProfile>> {
    return this._http.delete<ApiResponse<UserProfile>>(
      USER_API_ENDPOINTS.PROFILE.DELETE_BANNER_IMAGE,
    );
  }

  deleteProfilePicture(): Observable<ApiResponse<UserProfile>> {
    return this._http.delete<ApiResponse<UserProfile>>(
      USER_API_ENDPOINTS.PROFILE.DELETE_PROFILE_PICTURE,
    );
  }

  addUserSkill(skillId: string): Observable<ApiResponse<UserProfile>> {
    return this._http.post<ApiResponse<UserProfile>>(
      USER_API_ENDPOINTS.SKILLS.ADD,
      {
        skillId,
      },
    );
  }
  removeUserSkill(skillId: string): Observable<ApiResponse<UserProfile>> {
    return this._http.delete<ApiResponse<UserProfile>>(
      USER_API_ENDPOINTS.SKILLS.DELETE(skillId),
    );
  }

  addEducation(education: Education): Observable<ApiResponse<UserProfile>> {
    return this._http.post<ApiResponse<UserProfile>>(
      USER_API_ENDPOINTS.EDUCATION.ADD,
      education,
    );
  }
  updateEducation(
    index: number,
    education: Education,
  ): Observable<ApiResponse<UserProfile>> {
    return this._http.put<ApiResponse<UserProfile>>(
      USER_API_ENDPOINTS.EDUCATION.UPDATE,
      { index, education },
    );
  }

  deleteEducation(index: number): Observable<ApiResponse<UserProfile>> {
    return this._http.delete<ApiResponse<UserProfile>>(
      USER_API_ENDPOINTS.EDUCATION.DELETE(index),
    );
  }

  addExperience(experience: Experience): Observable<ApiResponse<UserProfile>> {
    return this._http.post<ApiResponse<UserProfile>>(
      USER_API_ENDPOINTS.EXPERIENCE.ADD,
      experience,
    );
  }
  updateExperience(
    index: number,
    experience: Experience,
  ): Observable<ApiResponse<UserProfile>> {
    return this._http.put<ApiResponse<UserProfile>>(
      USER_API_ENDPOINTS.EXPERIENCE.UPDATE,
      { experience, index },
    );
  }
  deleteExperience(index: number): Observable<ApiResponse<UserProfile>> {
    return this._http.delete<ApiResponse<UserProfile>>(
      USER_API_ENDPOINTS.EXPERIENCE.DELETE(index),
    );
  }

  uploadCertificate(file: File): Observable<ApiResponse<UserProfile>> {
    const formData = new FormData();

    formData.append('certificate', file);

    return this._http.post<ApiResponse<UserProfile>>(
      USER_API_ENDPOINTS.CERTIFICATES.ADD,
      formData,
    );
  }
  uploadResume(file: File): Observable<ApiResponse<UserProfile>> {
    const formData = new FormData();

    formData.append('resume', file);

    return this._http.post<ApiResponse<UserProfile>>(
     USER_API_ENDPOINTS.RESUMES.ADD,
      formData,
    );
  }
  deleteCertificate(documentKey: string): Observable<ApiResponse<UserProfile>> {
    return this._http.delete<ApiResponse<UserProfile>>(
     USER_API_ENDPOINTS.CERTIFICATES.DELETE(documentKey),
    );
  }
  deleteResume(documentKey: string): Observable<ApiResponse<UserProfile>> {
    return this._http.delete<ApiResponse<UserProfile>>(
      USER_API_ENDPOINTS.RESUMES.DELETE(documentKey),
    );
  }
}
