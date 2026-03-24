import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { ReportService } from '../../services/report.service';
import { SalesReport } from '../../models/report.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { CurrencyIdrPipe } from '../../shared/pipes/currency-idr.pipe';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatDividerModule,
    BaseChartDirective,
    PageHeaderComponent,
    CurrencyIdrPipe,
  ],
  template: `
    <app-page-header
      title="Sales Report"
      subtitle="Analyze your store's performance"
    >
      <button
        mat-stroked-button
        (click)="exportCsv()"
        [disabled]="!report || exporting"
      >
        <mat-icon>download</mat-icon>
        {{ exporting ? 'Exporting...' : 'Export CSV' }}
      </button>
    </app-page-header>

    <!-- Date Filter -->
    <mat-card class="filter-card">
      <mat-card-content>
        <form [formGroup]="filterForm" (ngSubmit)="loadReport()" class="filter-form">
          <mat-form-field appearance="outline">
            <mat-label>Start Date</mat-label>
            <input matInput [matDatepicker]="startPicker" formControlName="start_date" />
            <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>End Date</mat-label>
            <input matInput [matDatepicker]="endPicker" formControlName="end_date" />
            <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
          </mat-form-field>

          <div class="filter-actions">
            <button mat-flat-button color="primary" type="submit" [disabled]="loading">
              <mat-icon>search</mat-icon>
              {{ loading ? 'Loading...' : 'Generate Report' }}
            </button>

            <button mat-stroked-button type="button" (click)="setQuickRange(7)">Last 7d</button>
            <button mat-stroked-button type="button" (click)="setQuickRange(30)">Last 30d</button>
            <button mat-stroked-button type="button" (click)="setQuickRange(90)">Last 90d</button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>

    @if (loading) {
      <div class="loading-center"><mat-spinner diameter="48"></mat-spinner></div>
    }

    @if (reportError) {
      <mat-card class="empty-card">
        <mat-card-content class="empty-state">
          <mat-icon>error_outline</mat-icon>
          <p>Failed to load report. Please try again.</p>
          <button mat-flat-button color="primary" (click)="loadReport()">Retry</button>
        </mat-card-content>
      </mat-card>
    }

    @if (!loading && !reportError && report && report.total_orders === 0) {
      <mat-card class="empty-card">
        <mat-card-content class="empty-state">
          <mat-icon>bar_chart</mat-icon>
          <p>No orders found for the selected period.</p>
          <p class="empty-hint">Try selecting a wider date range.</p>
        </mat-card-content>
      </mat-card>
    }

    @if (report && report.total_orders > 0) {
      <!-- Stats Row -->
      <div class="stats-grid">
        @for (stat of summaryStats; track stat.title) {
          <mat-card class="stat-card" [style.border-left]="'4px solid ' + stat.color">
            <mat-card-content>
              <div class="stat-body">
                <p class="stat-label">{{ stat.title }}</p>
                <h2 class="stat-value">{{ stat.value }}</h2>
              </div>
              <div class="stat-icon" [style.background]="stat.bgColor">
                <mat-icon [style.color]="stat.color">{{ stat.icon }}</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>
        }
      </div>

      <div class="charts-row">
        <!-- Top Products Table -->
        <mat-card class="products-card">
          <mat-card-header>
            <mat-card-title>Top Products</mat-card-title>
            <mat-card-subtitle>By revenue in selected period</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="report.top_products" class="full-width">
              <ng-container matColumnDef="rank">
                <th mat-header-cell *matHeaderCellDef>#</th>
                <td mat-cell *matCellDef="let p; let i = index">
                  <span class="rank-badge">{{ i + 1 }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Product</th>
                <td mat-cell *matCellDef="let p">{{ p.product_name }}</td>
              </ng-container>

              <ng-container matColumnDef="sold">
                <th mat-header-cell *matHeaderCellDef>Units Sold</th>
                <td mat-cell *matCellDef="let p">{{ p.total_sold }}</td>
              </ng-container>

              <ng-container matColumnDef="revenue">
                <th mat-header-cell *matHeaderCellDef>Revenue</th>
                <td mat-cell *matCellDef="let p">
                  <strong class="revenue">{{ p.revenue | currencyIdr }}</strong>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="['rank','name','sold','revenue']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['rank','name','sold','revenue']"></tr>

              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell no-data" colspan="4">No product data available</td>
              </tr>
            </table>
          </mat-card-content>
        </mat-card>

        <!-- Order Status Chart -->
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Order Summary</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="bar-chart-container">
              <canvas baseChart
                [data]="barChartData"
                [options]="barChartOptions"
                type="bar"
              ></canvas>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    }
  `,
  styles: [`
    .filter-card { margin-bottom: 20px; border-radius: 12px !important; }

    .filter-form {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      align-items: flex-start;
    }

    .filter-actions {
      display: flex;
      gap: 8px;
      align-items: center;
      padding-top: 4px;
    }

    .loading-center { display: flex; justify-content: center; padding: 48px 0; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }

    .stat-card {
      border-radius: 12px !important;
      mat-card-content { display: flex; align-items: center; justify-content: space-between; }
    }

    .stat-body { flex: 1; }
    .stat-label { font-size: 13px; color: #888; margin: 0 0 6px; font-weight: 500; }
    .stat-value { font-size: 24px; font-weight: 700; color: #1a1a2e; margin: 0; }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      mat-icon { font-size: 24px; width: 24px; height: 24px; }
    }

    .charts-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;

      @media (max-width: 900px) { grid-template-columns: 1fr; }
    }

    .products-card, .chart-card { border-radius: 12px !important; }

    .full-width { width: 100%; }

    .rank-badge {
      display: inline-flex;
      width: 24px;
      height: 24px;
      background: #1a1a2e;
      color: #fff;
      border-radius: 50%;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
    }

    .revenue { color: #B8262F; }

    .bar-chart-container { height: 280px; canvas { max-height: 260px !important; } }

    .no-data { text-align: center; padding: 32px; color: #aaa; font-size: 13px; }

    .empty-card {
      border-radius: 12px !important;
      margin-bottom: 20px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 0;
      color: #aaa;
      mat-icon { font-size: 56px; width: 56px; height: 56px; margin-bottom: 12px; }
      p { margin: 0 0 6px; font-size: 14px; }
    }

    .empty-hint { font-size: 12px !important; color: #ccc !important; }
  `],
})
export class ReportsComponent implements OnInit {
  private readonly reportService = inject(ReportService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  report: SalesReport | null = null;
  reportError = false;
  loading = false;
  exporting = false;
  summaryStats: any[] = [];

  filterForm!: FormGroup;

  barChartData: ChartData<'bar'> = {
    labels: ['Total', 'Pending', 'Completed', 'Cancelled'],
    datasets: [{
      label: 'Orders',
      data: [],
      backgroundColor: ['#1565c0', '#f57f17', '#2e7d32', '#c62828'],
      borderRadius: 6,
    }],
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  ngOnInit(): void {
    this.setQuickRange(30);
  }

  setQuickRange(days: number): void {
    const end = new Date();
    const start = new Date(Date.now() - days * 86400000);

    if (!this.filterForm) {
      this.filterForm = this.fb.group({
        start_date: [start, Validators.required],
        end_date: [end, Validators.required],
      });
    } else {
      this.filterForm.patchValue({ start_date: start, end_date: end });
    }

    this.loadReport();
  }

  loadReport(): void {
    if (this.filterForm?.invalid) return;

    this.loading = true;
    this.reportError = false;
    this.report = null;
    const { start_date, end_date } = this.filterForm.value;

    this.reportService.getSalesReport({
      start_date: new Date(start_date).toISOString().split('T')[0],
      end_date: new Date(end_date).toISOString().split('T')[0],
    }).subscribe({
      next: (r) => {
        this.report = r;
        this.buildStats(r);
        this.buildChart(r);
        this.loading = false;
      },
      error: () => {
        this.reportError = true;
        this.loading = false;
      },
    });
  }

  private buildStats(r: SalesReport): void {
    this.summaryStats = [
      {
        title: 'Total Revenue',
        value: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(parseFloat(r.total_revenue)),
        icon: 'payments', color: '#B8262F', bgColor: '#fce4e5',
      },
      {
        title: 'Total Orders',
        value: r.total_orders.toLocaleString(),
        icon: 'shopping_bag', color: '#1565c0', bgColor: '#e3f2fd',
      },
      {
        title: 'Completed Orders',
        value: r.completed_orders.toLocaleString(),
        icon: 'check_circle', color: '#2e7d32', bgColor: '#e8f5e9',
      },
      {
        title: 'Cancelled Orders',
        value: r.cancelled_orders.toLocaleString(),
        icon: 'cancel', color: '#c62828', bgColor: '#fce4ec',
      },
      {
        title: 'Avg. Order Value',
        value: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(parseFloat(r.average_order)),
        icon: 'trending_up', color: '#f57f17', bgColor: '#fff8e1',
      },
    ];
  }

  private buildChart(r: SalesReport): void {
    this.barChartData = {
      labels: ['Total', 'Pending', 'Completed', 'Cancelled'],
      datasets: [{
        label: 'Orders',
        data: [r.total_orders, r.pending_orders, r.completed_orders, r.cancelled_orders],
        backgroundColor: ['#1565c0', '#f57f17', '#2e7d32', '#c62828'],
        borderRadius: 6,
      }],
    };
  }

  exportCsv(): void {
    if (!this.report || this.filterForm.invalid) return;

    this.exporting = true;
    const { start_date, end_date } = this.filterForm.value;

    this.reportService.exportSalesCsv({
      start_date: new Date(start_date).toISOString().split('T')[0],
      end_date: new Date(end_date).toISOString().split('T')[0],
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.exporting = false;
        this.snackBar.open('Report exported', 'Close', { duration: 3000 });
      },
      error: () => {
        this.exporting = false;
        // Fallback: generate CSV client-side
        this.generateClientCsv();
      },
    });
  }

  private generateClientCsv(): void {
    if (!this.report) return;

    const r = this.report;
    const rows = [
      ['Sales Report'],
      ['Period', r.start_date, 'to', r.end_date],
      [],
      ['Metric', 'Value'],
      ['Total Orders', r.total_orders],
      ['Total Revenue', r.total_revenue],
      ['Average Order', r.average_order],
      ['Pending Orders', r.pending_orders],
      ['Completed Orders', r.completed_orders],
      ['Cancelled Orders', r.cancelled_orders],
      [],
      ['Top Products'],
      ['#', 'Product Name', 'Units Sold', 'Revenue'],
      ...r.top_products.map((p, i) => [i + 1, p.product_name, p.total_sold, p.revenue]),
    ];

    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    this.snackBar.open('Report exported (client-side)', 'Close', { duration: 3000 });
  }
}
