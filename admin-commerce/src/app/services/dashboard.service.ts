import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api.model';
import { SalesReport } from '../models/report.model';
import { Customer } from '../models/customer.model';

export interface DashboardData {
  report: SalesReport;
  totalCustomers: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  getDashboardData(startDate: string, endDate: string): Observable<DashboardData> {
    const reportParams = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);

    return forkJoin({
      report: this.http
        .get<ApiResponse<SalesReport>>(`${environment.adminApiUrl}/reports/sales`, {
          params: reportParams,
        })
        .pipe(map((r) => r.data)),
      customers: this.http
        .get<ApiResponse<Customer[]>>(`${environment.adminApiUrl}/customers`, {
          params: new HttpParams().set('page', 1).set('limit', 1),
        }),
    }).pipe(
      map(({ report, customers }) => ({
        report,
        totalCustomers: customers.meta?.total ?? 0,
      }))
    );
  }
}
