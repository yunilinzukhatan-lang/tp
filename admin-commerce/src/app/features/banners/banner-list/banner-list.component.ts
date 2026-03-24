import { Component, inject, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { BannerService } from '../../../services/banner.service';
import { Banner, CreateBannerRequest } from '../../../models/banner.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

// Banner Form Dialog
@Component({
  selector: 'app-banner-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatSlideToggleModule, MatDatepickerModule,
    MatNativeDateModule, MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.banner ? 'Edit Banner' : 'Create Banner' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="banner-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Title *</mat-label>
          <input matInput formControlName="title" />
          @if (form.get('title')?.hasError('required') && form.get('title')?.touched) {
            <mat-error>Title is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Subtitle</mat-label>
          <input matInput formControlName="subtitle" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Image URL *</mat-label>
          <input matInput formControlName="image_url" placeholder="https://..." />
          <mat-icon matPrefix>image</mat-icon>
          @if (form.get('image_url')?.hasError('required') && form.get('image_url')?.touched) {
            <mat-error>Image URL is required</mat-error>
          }
        </mat-form-field>

        @if (form.get('image_url')?.value) {
          <div class="preview">
            <img [src]="form.get('image_url')?.value" alt="Preview" />
          </div>
        }

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Link URL</mat-label>
          <input matInput formControlName="link_url" placeholder="https://..." />
        </mat-form-field>

        <div class="date-row">
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
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Sort Order</mat-label>
          <input matInput type="number" formControlName="sort_order" />
        </mat-form-field>

        <mat-slide-toggle formControlName="is_active" color="primary">Active</mat-slide-toggle>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" (click)="submit()" [disabled]="loading">
        {{ loading ? 'Saving...' : (data.banner ? 'Update' : 'Create') }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .banner-form { display: flex; flex-direction: column; gap: 4px; padding-top: 8px; min-width: 480px; }
    .full-width { width: 100%; }
    .date-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .preview { margin: -8px 0 8px; img { width: 100%; max-height: 140px; object-fit: cover; border-radius: 8px; } }
  `],
})
export class BannerFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly bannerService = inject(BannerService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialogRef = inject(MatDialogRef<BannerFormDialogComponent>);

  form!: FormGroup;
  loading = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { banner?: Banner }) {}

  ngOnInit(): void {
    const b = this.data.banner;
    this.form = this.fb.group({
      title: [b?.title ?? '', Validators.required],
      subtitle: [b?.subtitle ?? ''],
      image_url: [b?.image_url ?? '', Validators.required],
      link_url: [b?.link_url ?? ''],
      is_active: [b?.is_active ?? true],
      sort_order: [b?.sort_order ?? 0],
      start_date: [b?.start_date ? new Date(b.start_date) : null],
      end_date: [b?.end_date ? new Date(b.end_date) : null],
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading = true;
    const val = this.form.value;
    const payload: CreateBannerRequest = {
      ...val,
      start_date: val.start_date ? new Date(val.start_date).toISOString() : undefined,
      end_date: val.end_date ? new Date(val.end_date).toISOString() : undefined,
    };

    const req$ = this.data.banner
      ? this.bannerService.updateBanner(this.data.banner.id, payload)
      : this.bannerService.createBanner(payload);

    req$.subscribe({
      next: () => {
        this.snackBar.open(this.data.banner ? 'Banner updated' : 'Banner created', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => { this.loading = false; },
    });
  }
}

// Main Banner List Component
@Component({
  selector: 'app-banner-list',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTooltipModule,
    PageHeaderComponent, StatusBadgeComponent,
  ],
  template: `
    <app-page-header title="Banners" subtitle="Manage homepage banners and promotions">
      <button mat-flat-button color="primary" (click)="openForm()">
        <mat-icon>add</mat-icon> Add Banner
      </button>
    </app-page-header>

    <div class="banner-grid">
      @for (banner of banners; track banner.id) {
        <mat-card class="banner-card">
          <div class="banner-image">
            <img [src]="banner.image_url" [alt]="banner.title" />
            <div class="banner-overlay">
              <button mat-icon-button color="primary" (click)="openForm(banner)" matTooltip="Edit">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteBanner(banner)" matTooltip="Delete">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>
          <mat-card-content>
            <div class="banner-info">
              <div>
                <h3 class="banner-title">{{ banner.title }}</h3>
                <p class="banner-subtitle">{{ banner.subtitle || '—' }}</p>
              </div>
              <app-status-badge [status]="banner.is_active ? 'active' : 'inactive'"></app-status-badge>
            </div>
            @if (banner.start_date || banner.end_date) {
              <div class="banner-dates">
                <mat-icon>schedule</mat-icon>
                {{ banner.start_date | date:'mediumDate' }} – {{ banner.end_date | date:'mediumDate' }}
              </div>
            }
          </mat-card-content>
        </mat-card>
      }

      @if (!banners.length) {
        <div class="empty-state">
          <mat-icon>image</mat-icon>
          <h3>No banners yet</h3>
          <p>Click "Add Banner" to create your first banner.</p>
          <button mat-flat-button color="primary" (click)="openForm()">Add Banner</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .banner-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }

    .banner-card { border-radius: 12px !important; overflow: hidden; }

    .banner-image {
      position: relative;
      height: 180px;
      overflow: hidden;
      background: #f5f5f5;

      img { width: 100%; height: 100%; object-fit: cover; display: block; }

      .banner-overlay {
        position: absolute;
        top: 8px;
        right: 8px;
        display: flex;
        gap: 4px;
        opacity: 0;
        transition: opacity 0.2s;
        background: rgba(255,255,255,0.9);
        border-radius: 8px;
        padding: 4px;
      }

      &:hover .banner-overlay { opacity: 1; }
    }

    .banner-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .banner-title { font-size: 15px; font-weight: 600; margin: 8px 0 4px; }
    .banner-subtitle { font-size: 13px; color: #888; margin: 0; }

    .banner-dates {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #888;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
    }

    .empty-state {
      grid-column: 1/-1;
      text-align: center;
      padding: 80px 24px;
      color: #aaa;
      mat-icon { font-size: 64px; width: 64px; height: 64px; display: block; margin: 0 auto 16px; }
      h3 { font-size: 20px; color: #666; margin: 0 0 8px; }
      p { margin: 0 0 24px; }
    }
  `],
})
export class BannerListComponent implements OnInit {
  private readonly bannerService = inject(BannerService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  banners: Banner[] = [];

  ngOnInit(): void {
    this.loadBanners();
  }

  loadBanners(): void {
    this.bannerService.getBanners().subscribe((b) => (this.banners = b));
  }

  openForm(banner?: Banner): void {
    const dialogRef = this.dialog.open(BannerFormDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      data: { banner },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.loadBanners();
    });
  }

  deleteBanner(banner: Banner): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Banner',
        message: `Delete "${banner.title}"?`,
        confirmText: 'Delete',
        confirmColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.bannerService.deleteBanner(banner.id).subscribe({
          next: () => {
            this.snackBar.open('Banner deleted', 'Close', { duration: 3000 });
            this.loadBanners();
          },
        });
      }
    });
  }
}
