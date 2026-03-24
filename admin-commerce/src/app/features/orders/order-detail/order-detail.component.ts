import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrderService } from '../../../services/order.service';
import { Order, OrderStatus } from '../../../models/order.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { CurrencyIdrPipe } from '../../../shared/pipes/currency-idr.pipe';

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['waiting_payment', 'cancelled'],
  waiting_payment: ['paid', 'cancelled'],
  paid: ['processing', 'cancelled'],
  processing: ['shipped'],
  shipped: ['completed'],
  completed: [],
  cancelled: [],
};

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDividerModule,
    MatTableModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    CurrencyIdrPipe,
  ],
  template: `
    @if (loading) {
      <div class="loading-center">
        <mat-spinner diameter="48"></mat-spinner>
      </div>
    } @else if (order) {
      <app-page-header
        [title]="order.order_number"
        subtitle="Order details and management"
      >
        <button mat-stroked-button routerLink="/orders">
          <mat-icon>arrow_back</mat-icon> Back
        </button>
      </app-page-header>

      <div class="detail-grid">
        <!-- Left Column -->
        <div class="left-col">
          <!-- Order Items -->
          <mat-card class="section-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>shopping_bag</mat-icon> Order Items
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <table mat-table [dataSource]="order.items ?? []" class="items-table">
                <ng-container matColumnDef="product">
                  <th mat-header-cell *matHeaderCellDef>Product</th>
                  <td mat-cell *matCellDef="let item">{{ item.product_name }}</td>
                </ng-container>
                <ng-container matColumnDef="price">
                  <th mat-header-cell *matHeaderCellDef>Price</th>
                  <td mat-cell *matCellDef="let item">{{ item.product_price | currencyIdr }}</td>
                </ng-container>
                <ng-container matColumnDef="qty">
                  <th mat-header-cell *matHeaderCellDef>Qty</th>
                  <td mat-cell *matCellDef="let item">{{ item.quantity }}</td>
                </ng-container>
                <ng-container matColumnDef="total">
                  <th mat-header-cell *matHeaderCellDef>Total</th>
                  <td mat-cell *matCellDef="let item"><strong>{{ item.total_price | currencyIdr }}</strong></td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="['product','price','qty','total']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['product','price','qty','total']"></tr>
              </table>

              <mat-divider class="my-16"></mat-divider>

              <!-- Summary -->
              <div class="order-summary">
                <div class="summary-row">
                  <span>Subtotal</span>
                  <span>{{ order.sub_total | currencyIdr }}</span>
                </div>
                @if (parseFloat(order.discount_amount) > 0) {
                  <div class="summary-row discount">
                    <span>Discount</span>
                    <span>-{{ order.discount_amount | currencyIdr }}</span>
                  </div>
                }
                <div class="summary-row">
                  <span>Shipping</span>
                  <span>{{ order.shipping_cost | currencyIdr }}</span>
                </div>
                <mat-divider></mat-divider>
                <div class="summary-row total">
                  <span>Total</span>
                  <strong>{{ order.total_amount | currencyIdr }}</strong>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Payment Info -->
          @if (order.payment) {
            <mat-card class="section-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>payment</mat-icon> Payment
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="label">Method</span>
                    <span class="value">{{ order.payment.payment_method }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Status</span>
                    <app-status-badge [status]="order.payment.status"></app-status-badge>
                  </div>
                  <div class="info-item">
                    <span class="label">Amount</span>
                    <span class="value">{{ order.payment.amount | currencyIdr }}</span>
                  </div>
                  @if (order.payment.paid_at) {
                    <div class="info-item">
                      <span class="label">Paid At</span>
                      <span class="value">{{ order.payment.paid_at | date:'medium' }}</span>
                    </div>
                  }
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>

        <!-- Right Column -->
        <div class="right-col">
          <!-- Status Management -->
          <mat-card class="section-card">
            <mat-card-header>
              <mat-card-title>Order Status</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="current-status">
                <app-status-badge [status]="order.status"></app-status-badge>
                <span class="status-date">{{ order.updated_at | date:'medium' }}</span>
              </div>

              @if (nextStatuses.length > 0) {
                <mat-divider class="my-16"></mat-divider>
                <p class="update-label">Update Status</p>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>New Status</mat-label>
                  <mat-select [(ngModel)]="selectedNewStatus">
                    @for (s of nextStatuses; track s) {
                      <mat-option [value]="s">{{ formatStatus(s) }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                <button
                  mat-flat-button
                  color="primary"
                  class="full-width"
                  (click)="updateStatus()"
                  [disabled]="!selectedNewStatus || updating"
                >
                  {{ updating ? 'Updating...' : 'Update Status' }}
                </button>
              } @else {
                <p class="terminal-status">This order is in a final state.</p>
              }
            </mat-card-content>
          </mat-card>

          <!-- Customer Info -->
          <mat-card class="section-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>person</mat-icon> Customer
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Name</span>
                  <span class="value">{{ order.customer?.first_name }} {{ order.customer?.last_name }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Email</span>
                  <span class="value">{{ order.customer?.user?.email }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Phone</span>
                  <span class="value">{{ order.customer?.phone }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Shipping Address -->
          @if (order.address) {
            <mat-card class="section-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>location_on</mat-icon> Shipping Address
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="address-block">
                  <strong>{{ order.address.recipient_name }}</strong>
                  <span>{{ order.address.phone }}</span>
                  <span>{{ order.address.address_line1 }}</span>
                  @if (order.address.address_line2) {
                    <span>{{ order.address.address_line2 }}</span>
                  }
                  <span>{{ order.address.city }}, {{ order.address.province }} {{ order.address.postal_code }}</span>
                </div>
              </mat-card-content>
            </mat-card>
          }

          <!-- Notes -->
          @if (order.notes) {
            <mat-card class="section-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>note</mat-icon> Notes
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <p class="notes-text">{{ order.notes }}</p>
              </mat-card-content>
            </mat-card>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .loading-center {
      display: flex;
      justify-content: center;
      padding: 80px 0;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 16px;
      align-items: start;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }

    .left-col, .right-col {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .section-card {
      border-radius: 12px !important;
      mat-card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px !important;
        mat-icon { font-size: 20px; width: 20px; height: 20px; color: #B8262F; }
      }
    }

    .items-table { width: 100%; }

    .order-summary {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      &.discount { color: #2e7d32; }
      &.total { font-size: 16px; font-weight: 600; }
    }

    .my-16 { margin: 16px 0 !important; }

    .info-grid { display: flex; flex-direction: column; gap: 12px; }

    .info-item {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      .label { color: #888; }
      .value { font-weight: 500; text-align: right; }
    }

    .current-status {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .status-date { font-size: 12px; color: #888; }

    .update-label {
      font-size: 13px;
      font-weight: 500;
      color: #666;
      margin: 0 0 8px;
    }

    .terminal-status {
      font-size: 13px;
      color: #888;
      font-style: italic;
      margin: 8px 0 0;
    }

    .full-width { width: 100%; }

    .address-block {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 14px;
      line-height: 1.6;
    }

    .notes-text {
      font-size: 14px;
      color: #555;
      line-height: 1.6;
      margin: 0;
      font-style: italic;
    }
  `],
})
export class OrderDetailComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  order: Order | null = null;
  loading = true;
  updating = false;
  selectedNewStatus: OrderStatus | '' = '';
  nextStatuses: OrderStatus[] = [];

  parseFloat = parseFloat;

  formatStatus(s: string): string {
    return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orderService.getOrder(id).subscribe({
        next: (order) => {
          this.order = order;
          this.nextStatuses = VALID_TRANSITIONS[order.status] ?? [];
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
    }
  }

  updateStatus(): void {
    if (!this.order || !this.selectedNewStatus) return;

    this.updating = true;
    this.orderService.updateOrderStatus(this.order.id, {
      status: this.selectedNewStatus as OrderStatus,
    }).subscribe({
      next: (updated) => {
        this.order = updated;
        this.nextStatuses = VALID_TRANSITIONS[updated.status] ?? [];
        this.selectedNewStatus = '';
        this.updating = false;
        this.snackBar.open('Order status updated', 'Close', { duration: 3000 });
      },
      error: () => {
        this.updating = false;
      },
    });
  }
}
