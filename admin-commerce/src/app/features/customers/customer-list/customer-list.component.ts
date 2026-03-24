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
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { CustomerService } from '../../../services/customer.service';
import { Customer } from '../../../models/customer.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-customer-list',
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
    MatInputModule,
    MatTooltipModule,
    PageHeaderComponent,
  ],
  template: `
    <app-page-header title="Customers" subtitle="Manage registered customers"></app-page-header>

    <mat-card class="filter-card">
      <mat-card-content>
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search customers</mat-label>
          <input matInput [(ngModel)]="searchTerm" (ngModelChange)="onSearch($event)" placeholder="Name, email..."/>
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>
      </mat-card-content>
    </mat-card>

    <mat-card class="table-card">
      <mat-card-content>
        <table mat-table [dataSource]="dataSource" class="full-width">
          <ng-container matColumnDef="avatar">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let c">
              <div class="avatar" [style.background]="getAvatarColor(c.first_name)">
                {{ getInitials(c) }}
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let c">
              <div class="name-cell">
                <span class="full-name">{{ c.first_name }} {{ c.last_name }}</span>
                <span class="email">{{ c.user?.email }}</span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="phone">
            <th mat-header-cell *matHeaderCellDef>Phone</th>
            <td mat-cell *matCellDef="let c">{{ c.phone || '—' }}</td>
          </ng-container>

          <ng-container matColumnDef="joined">
            <th mat-header-cell *matHeaderCellDef>Joined</th>
            <td mat-cell *matCellDef="let c">{{ c.created_at | date:'mediumDate' }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let c">
              <button mat-icon-button color="primary" [routerLink]="['/customers', c.id]" matTooltip="View Profile">
                <mat-icon>visibility</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns" class="clickable-row" [routerLink]="['/customers', row.id]"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell no-data" [attr.colspan]="columns.length">
              <mat-icon>people</mat-icon>
              <p>No customers found</p>
            </td>
          </tr>
        </table>

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
    .filter-card { margin-bottom: 16px; border-radius: 12px !important; }
    .search-field { min-width: 300px; }
    .table-card { border-radius: 12px !important; }
    .full-width { width: 100%; }

    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 700;
      font-size: 13px;
    }

    .name-cell { display: flex; flex-direction: column; }
    .full-name { font-weight: 500; font-size: 14px; }
    .email { font-size: 12px; color: #888; }

    .clickable-row { cursor: pointer; &:hover { background: #f8f9fa; } }

    .no-data {
      text-align: center; padding: 48px 0; color: #ccc;
      mat-icon { font-size: 48px; width: 48px; height: 48px; display: block; margin: 0 auto 8px; }
      p { margin: 0; }
    }
  `],
})
export class CustomerListComponent implements OnInit {
  private readonly customerService = inject(CustomerService);
  private readonly searchSubject = new Subject<string>();

  columns = ['avatar', 'name', 'phone', 'joined', 'actions'];
  dataSource = new MatTableDataSource<Customer>();
  searchTerm = '';
  totalItems = 0;
  currentPage = 1;
  pageSize = 20;

  ngOnInit(): void {
    this.loadCustomers();
    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe(() => {
      this.currentPage = 1;
      this.loadCustomers();
    });
  }

  loadCustomers(): void {
    this.customerService.getCustomers(this.currentPage, this.pageSize, this.searchTerm || undefined).subscribe((res) => {
      this.dataSource.data = res.data ?? [];
      this.totalItems = res.meta?.total ?? 0;
    });
  }

  onSearch(term: string): void {
    this.searchSubject.next(term);
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadCustomers();
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
