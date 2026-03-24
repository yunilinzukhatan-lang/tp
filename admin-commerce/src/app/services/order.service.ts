import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api.model';
import {
  Order,
  UpdateOrderStatusRequest,
  OrderListFilter,
} from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.adminApiUrl}/orders`;

  getOrders(filter: OrderListFilter = {}): Observable<ApiResponse<Order[]>> {
    let params = new HttpParams();
    if (filter.page) params = params.set('page', filter.page);
    if (filter.limit) params = params.set('limit', filter.limit);
    if (filter.status) params = params.set('status', filter.status);
    if (filter.start_date) params = params.set('start_date', filter.start_date);
    if (filter.end_date) params = params.set('end_date', filter.end_date);

    return this.http.get<ApiResponse<Order[]>>(this.base, { params });
  }

  getOrder(id: string): Observable<Order> {
    return this.http
      .get<ApiResponse<Order>>(`${this.base}/${id}`)
      .pipe(map((r) => r.data));
  }

  updateOrderStatus(id: string, payload: UpdateOrderStatusRequest): Observable<Order> {
    return this.http
      .patch<ApiResponse<Order>>(`${this.base}/${id}/status`, payload)
      .pipe(map((r) => r.data));
  }
}
