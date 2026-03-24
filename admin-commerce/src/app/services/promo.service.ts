import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api.model';
import { PromoCode, CreatePromoRequest, UpdatePromoRequest } from '../models/promo.model';

@Injectable({ providedIn: 'root' })
export class PromoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.adminApiUrl}/promos`;

  getPromos(): Observable<PromoCode[]> {
    return this.http
      .get<ApiResponse<PromoCode[]>>(this.base)
      .pipe(map((r) => r.data));
  }

  createPromo(payload: CreatePromoRequest): Observable<PromoCode> {
    return this.http
      .post<ApiResponse<PromoCode>>(this.base, payload)
      .pipe(map((r) => r.data));
  }

  updatePromo(id: string, payload: UpdatePromoRequest): Observable<PromoCode> {
    return this.http
      .put<ApiResponse<PromoCode>>(`${this.base}/${id}`, payload)
      .pipe(map((r) => r.data));
  }

  deletePromo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
