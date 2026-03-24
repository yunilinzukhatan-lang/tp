import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { Chart, registerables } from 'chart.js';
import { DashboardService, DashboardData } from '../../services/dashboard.service';
import { SalesReport, TopProduct } from '../../models/report.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { CurrencyIdrPipe } from '../../shared/pipes/currency-idr.pipe';

Chart.register(...registerables);

interface StatCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  bgColor: string;
  trend?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    BaseChartDirective,
    PageHeaderComponent,
    CurrencyIdrPipe,
  ],
  template: `
    <app-page-header
      title="Dashboard"
      subtitle="Welcome back! Here's what's happening with your store."
    >
      <mat-form-field appearance="outline" class="period-select">
        <mat-label>Period</mat-label>
        <mat-select [(ngModel)]="selectedPeriod" (ngModelChange)="onPeriodChange($event)">
          @for (p of periods; track p.value) {
            <mat-option [value]="p.value">{{ p.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </app-page-header>

    <!-- Stat Cards -->
    @if (loading) {
      <div class="stats-grid skeleton-grid">
        @for (i of [1,2,3,4]; track i) {
          <div class="stat-card skeleton"></div>
        }
      </div>
    } @else {
      <div class="stats-grid">
        @for (stat of statCards; track stat.title) {
          <mat-card class="stat-card" [style.border-left]="'4px solid ' + stat.color">
            <mat-card-content>
              <div class="stat-card__body">
                <div class="stat-card__info">
                  <p class="stat-card__label">{{ stat.title }}</p>
                  <h2 class="stat-card__value">{{ stat.value }}</h2>
                </div>
                <div class="stat-card__icon" [style.background]="stat.bgColor">
                  <mat-icon [style.color]="stat.color">{{ stat.icon }}</mat-icon>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        }
      </div>
    }

    <!-- Charts Row -->
    <div class="charts-grid">
      <!-- Order Status Chart -->
      <mat-card class="chart-card">
        <mat-card-header>
          <mat-card-title>Order Status Distribution</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (!loading && report) {
            <div class="chart-container">
              <canvas baseChart
                [data]="donutChartData"
                [options]="donutChartOptions"
                type="doughnut"
              ></canvas>
            </div>
          } @else {
            <div class="chart-placeholder skeleton"></div>
          }
        </mat-card-content>
      </mat-card>

      <!-- Top Products -->
      <mat-card class="chart-card">
        <mat-card-header>
          <mat-card-title>Top Products</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (!loading && report?.top_products?.length) {
            <div class="top-products">
              @for (product of report!.top_products | slice:0:5; track product.product_id; let i = $index) {
                <div class="top-product-item">
                  <span class="rank">{{ i + 1 }}</span>
                  <div class="product-info">
                    <span class="product-name">{{ product.product_name }}</span>
                    <span class="product-sold">{{ product.total_sold }} sold</span>
                  </div>
                  <span class="product-revenue">{{ product.revenue | currencyIdr }}</span>
                </div>
              }
            </div>
          } @else if (!loading) {
            <div class="empty-state">
              <mat-icon>bar_chart</mat-icon>
              <p>No product data available</p>
            </div>
          } @else {
            <div class="chart-placeholder skeleton"></div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .period-select {
      width: 160px;
      margin-bottom: -1.25em;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      border-radius: 12px !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06) !important;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0,0,0,0.1) !important;
      }
    }

    .stat-card__body {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }

    .stat-card__label {
      font-size: 13px;
      color: #888;
      margin: 0 0 8px;
      font-weight: 500;
    }

    .stat-card__value {
      font-size: 28px;
      font-weight: 700;
      color: #1a1a2e;
      margin: 0;
    }

    .stat-card__icon {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      mat-icon { font-size: 28px; width: 28px; height: 28px; }
    }

    .charts-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;

      @media (max-width: 900px) { grid-template-columns: 1fr; }
    }

    .chart-card {
      border-radius: 12px !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06) !important;
    }

    .chart-container {
      height: 280px;
      display: flex;
      align-items: center;
      justify-content: center;
      canvas { max-height: 260px !important; }
    }

    .chart-placeholder {
      height: 280px;
      border-radius: 8px;
    }

    .skeleton {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: skeleton-loading 1.5s infinite;
    }

    .skeleton-grid .stat-card {
      height: 100px;
      border-radius: 12px !important;
    }

    @keyframes skeleton-loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .top-products {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 8px 0;
    }

    .top-product-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      background: #f8f9fa;
      border-radius: 10px;
    }

    .rank {
      width: 28px;
      height: 28px;
      background: #B8262F;
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .product-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .product-name {
      font-size: 14px;
      font-weight: 500;
      color: #1a1a2e;
    }

    .product-sold {
      font-size: 12px;
      color: #888;
    }

    .product-revenue {
      font-size: 14px;
      font-weight: 600;
      color: #B8262F;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 0;
      color: #ccc;
      mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 8px; }
      p { margin: 0; font-size: 14px; }
    }
  `],
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  report: SalesReport | null = null;
  totalCustomers = 0;
  loading = true;
  selectedPeriod = '30';

  readonly periods = [
    { label: 'Last 7 days', value: '7' },
    { label: 'Last 30 days', value: '30' },
    { label: 'Last 90 days', value: '90' },
    { label: 'Last year', value: '365' },
  ];

  statCards: StatCard[] = [];

  donutChartData: ChartData<'doughnut'> = {
    labels: ['Pending', 'Completed', 'Cancelled', 'Processing'],
    datasets: [{ data: [], backgroundColor: ['#f57f17', '#2e7d32', '#c62828', '#B8262F'] }],
  };

  donutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
    },
  };

  ngOnInit(): void {
    this.loadData();
  }

  onPeriodChange(days: string): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading = true;
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - parseInt(this.selectedPeriod) * 86400000)
      .toISOString()
      .split('T')[0];

    this.dashboardService.getDashboardData(startDate, endDate).subscribe({
      next: (data: DashboardData) => {
        this.report = data.report;
        this.totalCustomers = data.totalCustomers;
        this.buildStatCards(data.report, data.totalCustomers);
        this.buildCharts(data.report);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  private buildStatCards(report: SalesReport, customers: number): void {
    this.statCards = [
      {
        title: 'Total Revenue',
        value: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(parseFloat(report.total_revenue)),
        icon: 'payments',
        color: '#B8262F',
        bgColor: '#fce4e5',
      },
      {
        title: 'Total Orders',
        value: report.total_orders.toLocaleString(),
        icon: 'shopping_bag',
        color: '#1565c0',
        bgColor: '#e3f2fd',
      },
      {
        title: 'Total Customers',
        value: customers.toLocaleString(),
        icon: 'people',
        color: '#2e7d32',
        bgColor: '#e8f5e9',
      },
      {
        title: 'Avg. Order Value',
        value: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(parseFloat(report.average_order)),
        icon: 'trending_up',
        color: '#f57f17',
        bgColor: '#fff8e1',
      },
    ];
  }

  private buildCharts(report: SalesReport): void {
    const pending = report.pending_orders;
    const completed = report.completed_orders;
    const cancelled = report.cancelled_orders;
    const processing = report.total_orders - pending - completed - cancelled;

    this.donutChartData = {
      labels: ['Pending', 'Completed', 'Cancelled', 'Processing'],
      datasets: [{
        data: [pending, completed, cancelled, Math.max(0, processing)],
        backgroundColor: ['#f57f17', '#2e7d32', '#c62828', '#B8262F'],
        hoverOffset: 8,
      }],
    };
  }
}
