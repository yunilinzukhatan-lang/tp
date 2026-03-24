import { Component, inject, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { Product, ProductImage } from '../../../models/product.model';
import { Category } from '../../../models/category.model';

export interface ProductFormData {
  product?: Product;
  categories: Category[];
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    FormsModule,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ isEdit ? 'Edit Product' : 'Create Product' }}
    </h2>

    <mat-dialog-content class="dialog-content">
      <mat-tab-group>
        <!-- Basic Info Tab -->
        <mat-tab label="Basic Info">
          <form [formGroup]="form" class="form-grid">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Product Name *</mat-label>
              <input matInput formControlName="name" placeholder="Enter product name" />
              @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
                <mat-error>Name is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Category *</mat-label>
              <mat-select formControlName="category_id">
                @for (cat of data.categories; track cat.id) {
                  <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
                }
              </mat-select>
              @if (form.get('category_id')?.hasError('required') && form.get('category_id')?.touched) {
                <mat-error>Category is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description *</mat-label>
              <textarea matInput formControlName="description" rows="4" placeholder="Describe the product..."></textarea>
              @if (form.get('description')?.hasError('required') && form.get('description')?.touched) {
                <mat-error>Description is required</mat-error>
              }
            </mat-form-field>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Price (Rp) *</mat-label>
                <input matInput type="number" formControlName="price" min="0" />
                <span matPrefix>Rp&nbsp;</span>
                @if (form.get('price')?.hasError('required') && form.get('price')?.touched) {
                  <mat-error>Price is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Weight (kg) *</mat-label>
                <input matInput type="number" formControlName="weight" min="0" step="0.001" />
                <span matSuffix>kg</span>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Stock *</mat-label>
                <input matInput type="number" formControlName="stock" min="0" />
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Slug (auto-generated if empty)</mat-label>
              <input matInput formControlName="slug" placeholder="product-slug" />
            </mat-form-field>

            <div class="toggle-row">
              <mat-slide-toggle formControlName="is_active" color="primary">
                Active (visible to customers)
              </mat-slide-toggle>
            </div>
          </form>
        </mat-tab>

        <!-- Images Tab -->
        @if (isEdit) {
          <mat-tab label="Images">
            <div class="images-section">
              <!-- Add Image Form -->
              <div class="add-image-form">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Image URL</mat-label>
                  <input matInput [(ngModel)]="newImageUrl" placeholder="https://..." />
                  <mat-icon matPrefix>image</mat-icon>
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Alt Text</mat-label>
                  <input matInput [(ngModel)]="newImageAlt" placeholder="Image description" />
                </mat-form-field>
                <div class="toggle-row">
                  <mat-slide-toggle [(ngModel)]="newImagePrimary" color="primary">
                    Set as primary image
                  </mat-slide-toggle>
                </div>
                <button
                  mat-flat-button
                  color="primary"
                  (click)="addImage()"
                  [disabled]="!newImageUrl"
                >
                  <mat-icon>add_photo_alternate</mat-icon>
                  Add Image
                </button>
              </div>

              <!-- Image list -->
              <div class="image-list">
                @for (img of productImages; track img.id) {
                  <div class="image-item">
                    <img [src]="img.url" [alt]="img.alt_text" />
                    <div class="image-item__info">
                      <span>{{ img.alt_text || 'No alt text' }}</span>
                      @if (img.is_primary) {
                        <span class="primary-badge">Primary</span>
                      }
                    </div>
                    <button mat-icon-button color="warn" (click)="removeImage(img)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                }
                @if (!productImages.length) {
                  <div class="no-images">
                    <mat-icon>photo_library</mat-icon>
                    <p>No images yet. Add an image URL above.</p>
                  </div>
                }
              </div>
            </div>
          </mat-tab>
        }
      </mat-tab-group>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-flat-button
        color="primary"
        (click)="onSubmit()"
        [disabled]="loading"
      >
        {{ loading ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product') }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-content {
      min-width: 560px;
      max-width: 100%;
      padding-top: 16px;
    }

    .form-grid {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 16px 0;
    }

    .full-width { width: 100%; }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
    }

    .toggle-row {
      padding: 8px 0 16px;
    }

    .images-section {
      padding: 16px 0;
    }

    .add-image-form {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 12px;
      margin-bottom: 16px;
    }

    .image-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .image-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px;
      border: 1px solid #eee;
      border-radius: 10px;

      img {
        width: 56px;
        height: 56px;
        object-fit: cover;
        border-radius: 8px;
        background: #f5f5f5;
      }
    }

    .image-item__info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 13px;
    }

    .primary-badge {
      display: inline-block;
      padding: 2px 8px;
      background: #e8f5e9;
      color: #2e7d32;
      border-radius: 10px;
      font-size: 11px;
      width: fit-content;
    }

    .no-images {
      text-align: center;
      padding: 32px;
      color: #ccc;
      mat-icon { font-size: 40px; width: 40px; height: 40px; display: block; margin: 0 auto 8px; }
      p { margin: 0; font-size: 13px; }
    }
  `],
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialogRef = inject(MatDialogRef<ProductFormComponent>);

  isEdit = false;
  loading = false;
  productImages: ProductImage[] = [];

  newImageUrl = '';
  newImageAlt = '';
  newImagePrimary = false;

  form!: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ProductFormData) {}

  ngOnInit(): void {
    this.isEdit = !!this.data.product;
    this.productImages = this.data.product?.images ? [...this.data.product.images] : [];

    this.form = this.fb.group({
      name: [this.data.product?.name ?? '', Validators.required],
      category_id: [this.data.product?.category_id ?? '', Validators.required],
      description: [this.data.product?.description ?? '', Validators.required],
      price: [this.data.product?.price ? parseFloat(this.data.product.price) : null, Validators.required],
      weight: [this.data.product?.weight ? parseFloat(this.data.product.weight) : null, Validators.required],
      stock: [this.data.product?.stock ?? 0, Validators.required],
      slug: [this.data.product?.slug ?? ''],
      is_active: [this.data.product?.is_active ?? true],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const payload = this.form.value;

    const request$ = this.isEdit
      ? this.productService.updateProduct(this.data.product!.id, payload)
      : this.productService.createProduct(payload);

    request$.subscribe({
      next: () => {
        this.snackBar.open(
          this.isEdit ? 'Product updated successfully' : 'Product created successfully',
          'Close',
          { duration: 3000 }
        );
        this.dialogRef.close(true);
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  addImage(): void {
    if (!this.newImageUrl || !this.data.product) return;

    this.productService.addImage(this.data.product.id, {
      url: this.newImageUrl,
      alt_text: this.newImageAlt,
      is_primary: this.newImagePrimary,
    }).subscribe({
      next: (img) => {
        this.productImages.push(img);
        this.newImageUrl = '';
        this.newImageAlt = '';
        this.newImagePrimary = false;
        this.snackBar.open('Image added', 'Close', { duration: 2000 });
      },
    });
  }

  removeImage(img: ProductImage): void {
    if (!this.data.product) return;

    this.productService.deleteImage(this.data.product.id, img.id).subscribe({
      next: () => {
        this.productImages = this.productImages.filter((i) => i.id !== img.id);
        this.snackBar.open('Image removed', 'Close', { duration: 2000 });
      },
    });
  }
}
