import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api.model';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.adminApiUrl}/categories`;

  getCategories(): Observable<Category[]> {
    return this.http
      .get<ApiResponse<Category[]>>(this.base)
      .pipe(map((r) => r.data));
  }

  createCategory(payload: CreateCategoryRequest): Observable<Category> {
    return this.http
      .post<ApiResponse<Category>>(this.base, payload)
      .pipe(map((r) => r.data));
  }

  updateCategory(id: string, payload: UpdateCategoryRequest): Observable<Category> {
    return this.http
      .put<ApiResponse<Category>>(`${this.base}/${id}`, payload)
      .pipe(map((r) => r.data));
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
