import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse, PaginationMeta } from '../../models/api-response.model';
import { API_ENDPOINTS } from '../../constants/api-endpoints.constants';
import { Observable } from 'rxjs';
import { Skill } from '../../models/skill.model';

@Injectable({
  providedIn: 'root',
})
export class SkillService {
  constructor(private _http: HttpClient) {}

  getSkillsPaginated(
    page = 1,
    limit = 10,
    search = ''
  ): Observable<ApiResponse<Skill[]>> {
    return this._http.get<ApiResponse<Skill[]>>(
      API_ENDPOINTS.SKILL.GET_SKILLS_PAGINATED,
      {
        params: { page, limit, search },
      }
    );
  }

  getSkill(id: string): Observable<ApiResponse<Skill>> {
    return this._http.get<ApiResponse<Skill>>(
      API_ENDPOINTS.SKILL.GET_SKILL(id)
    );
  }

  updateSkill(
    id: string,
    payload: Skill
  ): Observable<ApiResponse<Skill>> {
    return this._http.put<ApiResponse<Skill>>(API_ENDPOINTS.SKILL.UPDATE_SKILL(id), payload);
  }

  toggleBlock(id: string): Observable<ApiResponse<Skill>>  {
    return this._http.patch<ApiResponse<Skill>>(API_ENDPOINTS.SKILL.TOGGLE_BLOCK(id), {});
  }

  deleteSkill(id: string) : Observable<ApiResponse<null>> {
    return this._http.delete<ApiResponse<null>>(API_ENDPOINTS.SKILL.DELETE_SKILL(id));
  }
}
