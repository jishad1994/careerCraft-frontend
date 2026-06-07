import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ApiResponse } from "../../../models/api-response.model";
import { AdminStats } from "../../../models/admin/admin-stats.model";
import { environment } from "../../../environments/environment";
import { ADMIN_API_END_POINTS } from "../../../constants/admin-endpoints.constants";

@Injectable({ providedIn: "root" })
export class AdminStatsService {
    private readonly _http = inject(HttpClient);
    private readonly baseUrl = environment.apiUrl;

    getStats(): Observable<ApiResponse<AdminStats>> {
        return this._http.get<ApiResponse<AdminStats>>(ADMIN_API_END_POINTS.STATISTICS.GET_STATS);
    }
}
