import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { CategoryService } from '../../../services/category.service';
import { Category, CreateCategoryRequest } from '../../../models/category.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatTooltipModule,
    MatSelectModule,
    PageHeaderComponent,
    StatusBadgeComponent,
  ],
  template: `
    <app-page-header title="Categories" subtitle="Organize your product taxonomy">
      <button mat-flat-button color="primary" (click)="openForm()">
        <mat-icon>add</mat-icon> Add Category
      </button>
    </app-page-header>

    <div class="layout">
      <!-- Table -->
      <mat-card class="table-card">
        <mat-card-content>
          <table mat-table [dataSource]="dataSource" class="full-width">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let c">
                <div class="cat-name">
                  <mat-icon class="cat-icon">category</mat-icon>
                  <div>
                    <span class="name">{{ c.name }}</span>
                    <span class="slug">/{{ c.slug }}</span>
                  </div>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="parent">
              <th mat-header-cell *matHeaderCellDef>Parent</th>
              <td mat-cell *matCellDef="let c">
                {{ getParentName(c.parent_id) || '—' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>Description</th>
              <td mat-cell *matCellDef="let c">
                <span class="description-cell">{{ c.description || '—' }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let c">
                <app-status-badge [status]="c.is_active ? 'active' : 'inactive'"></app-status-badge>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let c">
                <div class="actions">
                  <button mat-icon-button color="primary" (click)="openForm(c)" matTooltip="Edit">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteCategory(c)" matTooltip="Delete">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns"></tr>

            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell no-data" [attr.colspan]="columns.length">
                <mat-icon>category</mat-icon>
                <p>No categories found</p>
              </td>
            </tr>
          </table>
        </mat-card-content>
      </mat-card>

      <!-- Form Panel -->
      @if (showForm) {
        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>{{ editing ? 'Edit' : 'New' }} Category</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-body">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Name *</mat-label>
                <input matInput formControlName="name" placeholder="e.g. Electronics" />
                @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
                  <mat-error>Name is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Slug (optional)</mat-label>
                <input matInput formControlName="slug" placeholder="electronics" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="3"></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Parent Category</mat-label>
                <mat-select formControlName="parent_id">
                  <mat-option [value]="null">None (Root Category)</mat-option>
                  @for (cat of categories; track cat.id) {
                    @if (!editing || cat.id !== editingId) {
                      <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
                    }
                  }
                </mat-select>
              </mat-form-field>

              <mat-slide-toggle formControlName="is_active" color="primary">
                Active
              </mat-slide-toggle>

              <div class="form-actions">
                <button mat-button type="button" (click)="cancelForm()">Cancel</button>
                <button mat-flat-button color="primary" type="submit" [disabled]="loading">
                  {{ loading ? 'Saving...' : (editing ? 'Update' : 'Create') }}
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;

      &:has(.form-card) {
        grid-template-columns: 1fr 380px;
      }
    }

    .table-card, .form-card {
      border-radius: 12px !important;
    }

    .full-width { width: 100%; }

    .cat-name {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .cat-icon { color: #B8262F; }

    .name { display: block; font-weight: 500; }
    .slug { display: block; font-size: 12px; color: #888; }

    .description-cell {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: block;
      font-size: 13px;
      color: #666;
    }

    .actions { display: flex; gap: 4px; }

    .form-body {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 8px 0;
    }

    .form-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 8px;
    }

    .no-data {
      text-align: center;
      padding: 48px 0;
      color: #ccc;
      mat-icon { font-size: 48px; width: 48px; height: 48px; display: block; margin: 0 auto 8px; }
      p { margin: 0; }
    }
  `],
})
export class CategoryListComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  columns = ['name', 'parent', 'description', 'status', 'actions'];
  dataSource = new MatTableDataSource<Category>();
  categories: Category[] = [];
  showForm = false;
  editing = false;
  editingId = '';
  loading = false;

  form!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
  }

  private initForm(cat?: Category): void {
    this.form = this.fb.group({
      name: [cat?.name ?? '', Validators.required],
      slug: [cat?.slug ?? ''],
      description: [cat?.description ?? ''],
      parent_id: [cat?.parent_id ?? null],
      is_active: [cat?.is_active ?? true],
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe((cats) => {
      this.categories = cats;
      this.dataSource.data = cats;
    });
  }

  openForm(cat?: Category): void {
    this.editing = !!cat;
    this.editingId = cat?.id ?? '';
    this.initForm(cat);
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editing = false;
    this.editingId = '';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const payload = this.form.value;

    const request$ = this.editing
      ? this.categoryService.updateCategory(this.editingId, payload)
      : this.categoryService.createCategory(payload);

    request$.subscribe({
      next: () => {
        this.snackBar.open(
          this.editing ? 'Category updated' : 'Category created',
          'Close',
          { duration: 3000 }
        );
        this.loading = false;
        this.cancelForm();
        this.loadCategories();
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  getParentName(parentId?: string): string {
    if (!parentId) return '';
    return this.categories.find((c) => c.id === parentId)?.name ?? '';
  }

  deleteCategory(cat: Category): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Category',
        message: `Delete "${cat.name}"? Products in this category may be affected.`,
        confirmText: 'Delete',
        confirmColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.categoryService.deleteCategory(cat.id).subscribe({
          next: () => {
            this.snackBar.open('Category deleted', 'Close', { duration: 3000 });
            this.loadCategories();
          },
        });
      }
    });
  }
}
