import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api.model';

export interface AddPointsRequest {
  phone_number: string;
  price: number;
  note?: string;
}

export interface PointsResponse {
  phone_number: string;
  total_points: number;
}

@Injectable({ providedIn: 'root' })
export class PointService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.adminApiUrl}/points`;

  /** POST /api/v1/admin/points — award points for a purchase price */
  addPoints(req: AddPointsRequest): Observable<PointsResponse> {
    return this.http
      .post<ApiResponse<PointsResponse>>(this.base, req)
      .pipe(map((r) => r.data));
  }
}
