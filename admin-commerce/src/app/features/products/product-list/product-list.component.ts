import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { Product } from '../../../models/product.model';
import { Category } from '../../../models/category.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CurrencyIdrPipe } from '../../../shared/pipes/currency-idr.pipe';
import { ProductFormComponent } from '../product-form/product-form.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    CurrencyIdrPipe,
  ],
  template: `
    <app-page-header title="Products" subtitle="Manage your product catalog">
      <button mat-flat-button color="primary" (click)="openForm()">
        <mat-icon>add</mat-icon> Add Product
      </button>
    </app-page-header>

    <!-- Filters -->
    <mat-card class="filter-card">
      <mat-card-content>
        <div class="filters">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search products</mat-label>
            <input matInput [(ngModel)]="searchTerm" (ngModelChange)="onSearch($event)" placeholder="Name, description..."/>
            <mat-icon matPrefix>search</mat-icon>
            @if (searchTerm) {
              <button matSuffix mat-icon-button (click)="clearSearch()">
                <mat-icon>close</mat-icon>
              </button>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Category</mat-label>
            <mat-select [(ngModel)]="selectedCategory" (ngModelChange)="loadProducts()">
              <mat-option value="">All Categories</mat-option>
              @for (cat of categories; track cat.id) {
                <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="selectedStatus" (ngModelChange)="loadProducts()">
              <mat-option value="">All</mat-option>
              <mat-option [value]="true">Active</mat-option>
              <mat-option [value]="false">Inactive</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card-content>
    </mat-card>

    <!-- Table -->
    <mat-card class="table-card">
      <mat-card-content>
        <div class="table-wrapper">
          <table mat-table [dataSource]="dataSource" class="product-table">
            <ng-container matColumnDef="image">
              <th mat-header-cell *matHeaderCellDef>Image</th>
              <td mat-cell *matCellDef="let p">
                <div class="product-image">
                  @if (getPrimaryImage(p)) {
                    <img [src]="getPrimaryImage(p)" [alt]="p.name" />
                  } @else {
                    <mat-icon class="no-image">image_not_supported</mat-icon>
                  }
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Product</th>
              <td mat-cell *matCellDef="let p">
                <div class="product-name-cell">
                  <span class="product-name">{{ p.name }}</span>
                  <span class="product-category">{{ p.category?.name }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="price">
              <th mat-header-cell *matHeaderCellDef>Price</th>
              <td mat-cell *matCellDef="let p">
                <strong>{{ p.price | currencyIdr }}</strong>
              </td>
            </ng-container>

            <ng-container matColumnDef="stock">
              <th mat-header-cell *matHeaderCellDef>Stock</th>
              <td mat-cell *matCellDef="let p">
                <span [class]="p.stock <= 5 ? 'stock-low' : 'stock-ok'">
                  {{ p.stock }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let p">
                <app-status-badge [status]="p.is_active ? 'active' : 'inactive'"></app-status-badge>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let p">
                <div class="actions">
                  <button mat-icon-button color="primary" (click)="openForm(p)" matTooltip="Edit">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteProduct(p)" matTooltip="Delete">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>

            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell no-data" [attr.colspan]="displayedColumns.length">
                <mat-icon>inbox</mat-icon>
                <p>No products found</p>
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
      align-items: flex-start;
    }

    .search-field { min-width: 280px; flex: 1; }

    .table-card {
      border-radius: 12px !important;
      overflow: hidden;
    }

    .table-wrapper { overflow-x: auto; }

    .product-table { width: 100%; }

    .product-image {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      overflow: hidden;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      img { width: 100%; height: 100%; object-fit: cover; }
      mat-icon { color: #ccc; }
    }

    .product-name-cell {
      display: flex;
      flex-direction: column;
    }

    .product-name { font-weight: 500; font-size: 14px; }
    .product-category { font-size: 12px; color: #888; }

    .stock-low { color: #c62828; font-weight: 600; }
    .stock-ok { color: #2e7d32; font-weight: 600; }

    .actions {
      display: flex;
      gap: 4px;
    }

    .no-data {
      text-align: center;
      padding: 48px 0;
      color: #ccc;
      mat-icon { font-size: 48px; width: 48px; height: 48px; display: block; margin: 0 auto 8px; }
      p { margin: 0; font-size: 14px; }
    }
  `],
})
export class ProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly searchSubject = new Subject<string>();

  displayedColumns = ['image', 'name', 'price', 'stock', 'status', 'actions'];
  dataSource = new MatTableDataSource<Product>();

  categories: Category[] = [];
  searchTerm = '';
  selectedCategory = '';
  selectedStatus: boolean | '' = '';
  totalItems = 0;
  currentPage = 1;
  pageSize = 20;

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe((cats) => (this.categories = cats));
    this.loadProducts();

    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe(() => {
      this.currentPage = 1;
      this.loadProducts();
    });
  }

  loadProducts(): void {
    const filter: any = {
      page: this.currentPage,
      limit: this.pageSize,
    };
    if (this.searchTerm) filter.search = this.searchTerm;
    if (this.selectedCategory) filter.category_id = this.selectedCategory;
    if (this.selectedStatus !== '') filter.is_active = this.selectedStatus;

    this.productService.getProducts(filter).subscribe((res) => {
      this.dataSource.data = res.data ?? [];
      this.totalItems = res.meta?.total ?? 0;
    });
  }

  onSearch(term: string): void {
    this.searchSubject.next(term);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.loadProducts();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadProducts();
  }

  getPrimaryImage(product: Product): string {
    const primary = product.images?.find((i) => i.is_primary);
    return primary?.url ?? product.images?.[0]?.url ?? '';
  }

  openForm(product?: Product): void {
    const dialogRef = this.dialog.open(ProductFormComponent, {
      width: '700px',
      maxWidth: '95vw',
      data: { product, categories: this.categories },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.loadProducts();
    });
  }

  deleteProduct(product: Product): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Product',
        message: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        confirmColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.productService.deleteProduct(product.id).subscribe({
          next: () => {
            this.snackBar.open('Product deleted successfully', 'Close', { duration: 3000 });
            this.loadProducts();
          },
        });
      }
    });
  }
}
