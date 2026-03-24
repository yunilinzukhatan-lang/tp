import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api.model';
import { SalesReport, ReportFilter } from '../models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);

  getSalesReport(filter: ReportFilter): Observable<SalesReport> {
    const params = new HttpParams()
      .set('start_date', filter.start_date)
      .set('end_date', filter.end_date);

    return this.http
      .get<ApiResponse<SalesReport>>(`${environment.adminApiUrl}/reports/sales`, { params })
      .pipe(map((r) => r.data));
  }

  exportSalesCsv(filter: ReportFilter): Observable<Blob> {
    const params = new HttpParams()
      .set('start_date', filter.start_date)
      .set('end_date', filter.end_date)
      .set('format', 'csv');

    return this.http.get(`${environment.adminApiUrl}/reports/sales`, {
      params,
      responseType: 'blob',
    });
  }
}
