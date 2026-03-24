import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { CustomerService } from '../../../services/customer.service';
import { Customer } from '../../../models/customer.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    PageHeaderComponent,
  ],
  template: `
    @if (loading) {
      <div class="loading-center"><mat-spinner diameter="48"></mat-spinner></div>
    } @else if (customer) {
      <app-page-header [title]="customer.first_name + ' ' + customer.last_name" subtitle="Customer profile">
        <button mat-stroked-button routerLink="/customers">
          <mat-icon>arrow_back</mat-icon> Back
        </button>
      </app-page-header>

      <div class="profile-grid">
        <!-- Profile Card -->
        <mat-card class="profile-card">
          <mat-card-content>
            <div class="profile-header">
              <div class="avatar-lg" [style.background]="getAvatarColor(customer.first_name)">
                {{ getInitials(customer) }}
              </div>
              <h2>{{ customer.first_name }} {{ customer.last_name }}</h2>
              <p>{{ customer.user?.email }}</p>
              <mat-chip [class]="customer.user?.is_active ? 'chip-active' : 'chip-inactive'">
                {{ customer.user?.is_active ? 'Active' : 'Inactive' }}
              </mat-chip>
            </div>

            <mat-divider class="my-16"></mat-divider>

            <div class="info-list">
              <div class="info-row">
                <mat-icon>phone</mat-icon>
                <span>{{ customer.phone || 'Not provided' }}</span>
              </div>
              <div class="info-row">
                <mat-icon>email</mat-icon>
                <span>{{ customer.user?.email }}</span>
              </div>
              <div class="info-row">
                <mat-icon>calendar_today</mat-icon>
                <span>Joined {{ customer.created_at | date:'mediumDate' }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Addresses -->
        <div class="details-col">
          <mat-card class="section-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>location_on</mat-icon> Addresses
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              @if (customer.addresses?.length) {
                <div class="address-list">
                  @for (addr of customer.addresses; track addr.id) {
                    <div class="address-card" [class.default]="addr.is_default">
                      <div class="address-header">
                        <span class="addr-label">{{ addr.label }}</span>
                        @if (addr.is_default) {
                          <mat-chip class="chip-default">Default</mat-chip>
                        }
                      </div>
                      <p class="addr-name">{{ addr.recipient_name }} · {{ addr.phone }}</p>
                      <p class="addr-text">
                        {{ addr.address_line1 }}{{ addr.address_line2 ? ', ' + addr.address_line2 : '' }},
                        {{ addr.city }}, {{ addr.province }} {{ addr.postal_code }}
                      </p>
                    </div>
                  }
                </div>
              } @else {
                <div class="empty-section">
                  <mat-icon>location_off</mat-icon>
                  <p>No addresses added</p>
                </div>
              }
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    }
  `,
  styles: [`
    .loading-center { display: flex; justify-content: center; padding: 80px 0; }

    .profile-grid {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 16px;
      align-items: start;
      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }

    .profile-card, .section-card { border-radius: 12px !important; }

    .profile-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 8px;
      padding: 8px 0;
      h2 { font-size: 20px; font-weight: 600; margin: 0; }
      p { font-size: 14px; color: #888; margin: 0; }
    }

    .avatar-lg {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 700;
      font-size: 28px;
    }

    .my-16 { margin: 16px 0 !important; }

    .info-list { display: flex; flex-direction: column; gap: 12px; }

    .info-row {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      mat-icon { color: #888; font-size: 18px; width: 18px; height: 18px; }
    }

    .details-col { display: flex; flex-direction: column; gap: 16px; }

    .section-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px !important;
      mat-icon { color: #B8262F; font-size: 20px; width: 20px; height: 20px; }
    }

    .address-list { display: flex; flex-direction: column; gap: 12px; }

    .address-card {
      padding: 14px;
      border: 1px solid #e0e0e0;
      border-radius: 10px;
      &.default { border-color: #B8262F; }
    }

    .address-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .addr-label { font-weight: 600; font-size: 14px; }
    .addr-name { font-size: 13px; color: #555; margin: 0 0 4px; }
    .addr-text { font-size: 13px; color: #888; margin: 0; line-height: 1.5; }

    .chip-active { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-inactive { background: #fce4ec !important; color: #c62828 !important; }
    .chip-default { background: #fce4e5 !important; color: #B8262F !important; font-size: 11px !important; }

    .empty-section {
      text-align: center;
      padding: 32px;
      color: #ccc;
      mat-icon { font-size: 40px; width: 40px; height: 40px; display: block; margin: 0 auto 8px; }
      p { margin: 0; font-size: 13px; }
    }
  `],
})
export class CustomerDetailComponent implements OnInit {
  private readonly customerService = inject(CustomerService);
  private readonly route = inject(ActivatedRoute);

  customer: Customer | null = null;
  loading = true;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.customerService.getCustomer(id).subscribe({
        next: (c) => { this.customer = c; this.loading = false; },
        error: () => { this.loading = false; },
      });
    }
  }

  getInitials(c: Customer): string {
    return `${c.first_name?.[0] ?? ''}${c.last_name?.[0] ?? ''}`.toUpperCase();
  }

  getAvatarColor(name: string): string {
    const colors = ['#B8262F', '#1565c0', '#2e7d32', '#f57f17', '#6a1b9a', '#00695c'];
    const idx = (name?.charCodeAt(0) ?? 0) % colors.length;
    return colors[idx];
  }
}
