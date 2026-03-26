import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api.model';

export interface UploadResponse {
  key: string;
  url: string;
}

@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.adminApiUrl}/uploads`;

  /**
   * Upload a file to Cloudflare R2 via the backend proxy.
   * @param file    The File object selected by the user
   * @param folder  Optional folder prefix stored in R2 (e.g. 'products', 'banners')
   */
  upload(file: File, folder = 'products'): Observable<UploadResponse> {
    const form = new FormData();
    form.append('file', file);
    form.append('folder', folder);

    return this.http
      .post<ApiResponse<UploadResponse>>(this.base, form)
      .pipe(map((r) => r.data));
  }
}
