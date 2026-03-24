import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OrderService } from '../../../services/order.service';
import { Order, OrderStatus } from '../../../models/order.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { CurrencyIdrPipe } from '../../../shared/pipes/currency-idr.pipe';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    CurrencyIdrPipe,
  ],
  template: `
    <app-page-header title="Orders" subtitle="Manage and track customer orders">
    </app-page-header>

    <!-- Filters -->
    <mat-card class="filter-card">
      <mat-card-content>
        <div class="filters">
          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="selectedStatus" (ngModelChange)="onFilterChange()">
              <mat-option value="">All Statuses</mat-option>
              @for (s of statuses; track s.value) {
                <mat-option [value]="s.value">{{ s.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>From Date</mat-label>
            <input matInput [matDatepicker]="fromPicker" [(ngModel)]="startDate" (ngModelChange)="onFilterChange()" />
            <mat-datepicker-toggle matSuffix [for]="fromPicker"></mat-datepicker-toggle>
            <mat-datepicker #fromPicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>To Date</mat-label>
            <input matInput [matDatepicker]="toPicker" [(ngModel)]="endDate" (ngModelChange)="onFilterChange()" />
            <mat-datepicker-toggle matSuffix [for]="toPicker"></mat-datepicker-toggle>
            <mat-datepicker #toPicker></mat-datepicker>
          </mat-form-field>

          <button mat-stroked-button (click)="clearFilters()">
            <mat-icon>clear</mat-icon> Clear
          </button>
        </div>
      </mat-card-content>
    </mat-card>

    <!-- Table -->
    <mat-card class="table-card">
      <mat-card-content>
        <div class="table-wrapper">
          <table mat-table [dataSource]="dataSource">
            <ng-container matColumnDef="order_number">
              <th mat-header-cell *matHeaderCellDef>Order #</th>
              <td mat-cell *matCellDef="let o">
                <span class="order-number">{{ o.order_number }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="customer">
              <th mat-header-cell *matHeaderCellDef>Customer</th>
              <td mat-cell *matCellDef="let o">
                <div class="customer-cell">
                  <span class="customer-name">{{ o.customer?.first_name }} {{ o.customer?.last_name }}</span>
                  <span class="customer-email">{{ o.customer?.user?.email }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="total">
              <th mat-header-cell *matHeaderCellDef>Total</th>
              <td mat-cell *matCellDef="let o">
                <strong>{{ o.total_amount | currencyIdr }}</strong>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let o">
                <app-status-badge [status]="o.status"></app-status-badge>
              </td>
            </ng-container>

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let o">
                {{ o.created_at | date:'mediumDate' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let o">
                <button mat-icon-button color="primary" [routerLink]="['/orders', o.id]" matTooltip="View Detail">
                  <mat-icon>visibility</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns" class="clickable-row" [routerLink]="['/orders', row.id]"></tr>

            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell no-data" [attr.colspan]="columns.length">
                <mat-icon>shopping_cart</mat-icon>
                <p>No orders found</p>
              </td>
            </tr>
          </table>
        </div>

        <mat-paginator
          [length]="totalItems"
          [pageSize]="pageSize"
          [pageSizeOptions]="[10, 20, 50]"
          (page)="onPageChange($event)"
          showFirstLastButtons
        ></mat-paginator>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .filter-card {
      margin-bottom: 16px;
      border-radius: 12px !important;
    }

    .filters {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      align-items: center;
    }

    .table-card { border-radius: 12px !important; overflow: hidden; }
    .table-wrapper { overflow-x: auto; }

    .order-number {
      font-family: monospace;
      font-weight: 600;
      color: #1a1a2e;
      font-size: 13px;
    }

    .customer-cell { display: flex; flex-direction: column; }
    .customer-name { font-weight: 500; font-size: 14px; }
    .customer-email { font-size: 12px; color: #888; }

    .clickable-row { cursor: pointer; &:hover { background: #f8f9fa; } }

    .no-data {
      text-align: center; padding: 48px 0; color: #ccc;
      mat-icon { font-size: 48px; width: 48px; height: 48px; display: block; margin: 0 auto 8px; }
      p { margin: 0; }
    }
  `],
})
export class OrderListComponent implements OnInit {
  private readonly orderService = inject(OrderService);

  columns = ['order_number', 'customer', 'total', 'status', 'date', 'actions'];
  dataSource = new MatTableDataSource<Order>();

  statuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'waiting_payment', label: 'Waiting Payment' },
    { value: 'paid', label: 'Paid' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  selectedStatus = '';
  startDate: Date | null = null;
  endDate: Date | null = null;
  totalItems = 0;
  currentPage = 1;
  pageSize = 20;

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    const filter: any = {
      page: this.currentPage,
      limit: this.pageSize,
    };
    if (this.selectedStatus) filter.status = this.selectedStatus as OrderStatus;
    if (this.startDate) filter.start_date = this.startDate.toISOString().split('T')[0];
    if (this.endDate) filter.end_date = this.endDate.toISOString().split('T')[0];

    this.orderService.getOrders(filter).subscribe((res) => {
      this.dataSource.data = res.data ?? [];
      this.totalItems = res.meta?.total ?? 0;
    });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

  clearFilters(): void {
    this.selectedStatus = '';
    this.startDate = null;
    this.endDate = null;
    this.loadOrders();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadOrders();
  }
}
