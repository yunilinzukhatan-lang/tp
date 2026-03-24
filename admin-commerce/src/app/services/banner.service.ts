import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api.model';
import { Banner, CreateBannerRequest, UpdateBannerRequest } from '../models/banner.model';

@Injectable({ providedIn: 'root' })
export class BannerService {
    private readonly http = inject(HttpClient);
    private readonly base = `${environment.adminApiUrl}/banners`;

    getBanners(): Observable<Banner[]> {
        return this.http
            .get<ApiResponse<Banner[]>>(this.base)
            .pipe(map((r) => r.data));
    }

    createBanner(payload: CreateBannerRequest): Observable<Banner> {
        return this.http
            .post<ApiResponse<Banner>>(this.base, payload)
            .pipe(map((r) => r.data));
    }

    updateBanner(id: string, payload: UpdateBannerRequest): Observable<Banner> {
        return this.http
            .put<ApiResponse<Banner>>(`${this.base}/${id}`, payload)
            .pipe(map((r) => r.data));
    }

    deleteBanner(id: string): Observable<void> {
        return this.http.delete<void>(`${this.base}/${id}`);
    }
}
