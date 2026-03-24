import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api.model';
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductListFilter,
  ProductImage,
} from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.adminApiUrl}/products`;

  getProducts(filter: ProductListFilter = {}): Observable<ApiResponse<Product[]>> {
    let params = new HttpParams();
    if (filter.page) params = params.set('page', filter.page);
    if (filter.limit) params = params.set('limit', filter.limit);
    if (filter.search) params = params.set('search', filter.search);
    if (filter.category_id) params = params.set('category_id', filter.category_id);
    if (filter.is_active !== undefined) params = params.set('is_active', filter.is_active);
    if (filter.sort_by) params = params.set('sort_by', filter.sort_by);
    if (filter.sort_order) params = params.set('sort_order', filter.sort_order);

    return this.http.get<ApiResponse<Product[]>>(this.base, { params });
  }

  getProduct(id: string): Observable<Product> {
    return this.http
      .get<ApiResponse<Product>>(`${this.base}/${id}`)
      .pipe(map((r) => r.data));
  }

  createProduct(payload: CreateProductRequest): Observable<Product> {
    return this.http
      .post<ApiResponse<Product>>(this.base, payload)
      .pipe(map((r) => r.data));
  }

  updateProduct(id: string, payload: UpdateProductRequest): Observable<Product> {
    return this.http
      .put<ApiResponse<Product>>(`${this.base}/${id}`, payload)
      .pipe(map((r) => r.data));
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  addImage(productId: string, payload: { url: string; alt_text?: string; is_primary?: boolean; sort_order?: number }): Observable<ProductImage> {
    return this.http
      .post<ApiResponse<ProductImage>>(`${this.base}/${productId}/images`, payload)
      .pipe(map((r) => r.data));
  }

  deleteImage(productId: string, imageId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${productId}/images/${imageId}`);
  }
}
