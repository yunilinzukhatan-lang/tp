import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api.model';
import { Customer } from '../models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.adminApiUrl}/customers`;

  getCustomers(page = 1, limit = 20, search?: string): Observable<ApiResponse<Customer[]>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);

    return this.http.get<ApiResponse<Customer[]>>(this.base, { params });
  }

  getCustomer(id: string): Observable<Customer> {
    return this.http
      .get<ApiResponse<Customer>>(`${this.base}/${id}`)
      .pipe(map((r) => r.data));
  }
}
