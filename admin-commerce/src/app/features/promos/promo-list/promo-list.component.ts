import { Component, inject, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { PromoService } from '../../../services/promo.service';
import { PromoCode, CreatePromoRequest } from '../../../models/promo.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CurrencyIdrPipe } from '../../../shared/pipes/currency-idr.pipe';

// Promo Form Dialog
@Component({
  selector: 'app-promo-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatSelectModule, MatSlideToggleModule,
    MatDatepickerModule, MatNativeDateModule, MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.promo ? 'Edit Promo' : 'Create Promo Code' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="promo-form">
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Code *</mat-label>
            <input matInput formControlName="code" placeholder="SAVE10" style="text-transform:uppercase"/>
            @if (form.get('code')?.hasError('required') && form.get('code')?.touched) {
              <mat-error>Code is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Name *</mat-label>
            <input matInput formControlName="name" placeholder="Save 10%" />
            @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
              <mat-error>Name is required</mat-error>
            }
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="2"></textarea>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Discount Type *</mat-label>
            <mat-select formControlName="type">
              <mat-option value="percentage">Percentage (%)</mat-option>
              <mat-option value="fixed">Fixed Amount (Rp)</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Discount Value *</mat-label>
            <input matInput type="number" formControlName="value" min="0" />
            <span matSuffix>{{ form.get('type')?.value === 'percentage' ? '%' : 'Rp' }}</span>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Min Purchase (Rp)</mat-label>
            <input matInput type="number" formControlName="min_purchase" min="0" />
            <span matPrefix>Rp&nbsp;</span>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Max Discount (Rp)</mat-label>
            <input matInput type="number" formControlName="max_discount" min="0" />
            <span matPrefix>Rp&nbsp;</span>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Usage Limit (0=unlimited)</mat-label>
            <input matInput type="number" formControlName="usage_limit" min="0" />
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Start Date *</mat-label>
            <input matInput [matDatepicker]="startPicker" formControlName="start_date" />
            <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
            @if (form.get('start_date')?.hasError('required') && form.get('start_date')?.touched) {
              <mat-error>Start date is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>End Date *</mat-label>
            <input matInput [matDatepicker]="endPicker" formControlName="end_date" />
            <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
            @if (form.get('end_date')?.hasError('required') && form.get('end_date')?.touched) {
              <mat-error>End date is required</mat-error>
            }
          </mat-form-field>
        </div>

        <mat-slide-toggle formControlName="is_active" color="primary">Active</mat-slide-toggle>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" (click)="submit()" [disabled]="loading">
        {{ loading ? 'Saving...' : (data.promo ? 'Update' : 'Create') }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .promo-form { display: flex; flex-direction: column; gap: 4px; padding-top: 8px; min-width: 520px; }
    .full-width { width: 100%; }
    .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; }
  `],
})
export class PromoFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly promoService = inject(PromoService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialogRef = inject(MatDialogRef<PromoFormDialogComponent>);

  form!: FormGroup;
  loading = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { promo?: PromoCode }) {}

  ngOnInit(): void {
    const p = this.data.promo;
    this.form = this.fb.group({
      code: [p?.code ?? '', Validators.required],
      name: [p?.name ?? '', Validators.required],
      description: [p?.description ?? ''],
      type: [p?.type ?? 'percentage', Validators.required],
      value: [p?.value ? parseFloat(p.value) : null, Validators.required],
      min_purchase: [p?.min_purchase ? parseFloat(p.min_purchase) : 0],
      max_discount: [p?.max_discount ? parseFloat(p.max_discount) : 0],
      usage_limit: [p?.usage_limit ?? 0],
      start_date: [p?.start_date ? new Date(p.start_date) : null, Validators.required],
      end_date: [p?.end_date ? new Date(p.end_date) : null, Validators.required],
      is_active: [p?.is_active ?? true],
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    const val = this.form.value;
    const payload: CreatePromoRequest = {
      ...val,
      code: val.code.toUpperCase(),
      start_date: new Date(val.start_date).toISOString(),
      end_date: new Date(val.end_date).toISOString(),
    };

    const req$ = this.data.promo
      ? this.promoService.updatePromo(this.data.promo.id, payload)
      : this.promoService.createPromo(payload);

    req$.subscribe({
      next: () => {
        this.snackBar.open(this.data.promo ? 'Promo updated' : 'Promo created', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => { this.loading = false; },
    });
  }
}

// Main Component
@Component({
  selector: 'app-promo-list',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatCardModule, MatButtonModule, MatIconModule,
    MatTooltipModule, MatChipsModule, PageHeaderComponent, StatusBadgeComponent, CurrencyIdrPipe,
  ],
  template: `
    <app-page-header title="Promo Codes" subtitle="Manage discount codes and promotions">
      <button mat-flat-button color="primary" (click)="openForm()">
        <mat-icon>add</mat-icon> Add Promo
      </button>
    </app-page-header>

    <mat-card class="table-card">
      <mat-card-content>
        <table mat-table [dataSource]="dataSource" class="full-width">
          <ng-container matColumnDef="code">
            <th mat-header-cell *matHeaderCellDef>Code</th>
            <td mat-cell *matCellDef="let p">
              <div class="code-cell">
                <span class="code-chip">{{ p.code }}</span>
                <span class="code-name">{{ p.name }}</span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="discount">
            <th mat-header-cell *matHeaderCellDef>Discount</th>
            <td mat-cell *matCellDef="let p">
              <strong>
                {{ p.type === 'percentage' ? p.value + '%' : (p.value | currencyIdr) }}
              </strong>
              <span class="type-label">{{ p.type }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="usage">
            <th mat-header-cell *matHeaderCellDef>Usage</th>
            <td mat-cell *matCellDef="let p">
              {{ p.used_count }} / {{ p.usage_limit === 0 ? '∞' : p.usage_limit }}
            </td>
          </ng-container>

          <ng-container matColumnDef="validity">
            <th mat-header-cell *matHeaderCellDef>Validity</th>
            <td mat-cell *matCellDef="let p">
              <div class="date-range">
                <span>{{ p.start_date | date:'mediumDate' }}</span>
                <span class="separator">→</span>
                <span>{{ p.end_date | date:'mediumDate' }}</span>
              </div>
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
                <button mat-icon-button color="warn" (click)="deletePromo(p)" matTooltip="Delete">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell no-data" [attr.colspan]="columns.length">
              <mat-icon>local_offer</mat-icon>
              <p>No promo codes found</p>
            </td>
          </tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .table-card { border-radius: 12px !important; }
    .full-width { width: 100%; }

    .code-cell { display: flex; flex-direction: column; gap: 2px; }
    .code-chip {
      display: inline-block;
      background: #1a1a2e;
      color: #fff;
      padding: 2px 10px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      font-family: monospace;
      width: fit-content;
    }
    .code-name { font-size: 12px; color: #666; }

    .type-label { display: block; font-size: 11px; color: #888; }

    .date-range { display: flex; align-items: center; gap: 4px; font-size: 13px; }
    .separator { color: #B8262F; }

    .actions { display: flex; gap: 4px; }

    .no-data {
      text-align: center; padding: 48px 0; color: #ccc;
      mat-icon { font-size: 48px; width: 48px; height: 48px; display: block; margin: 0 auto 8px; }
      p { margin: 0; }
    }
  `],
})
export class PromoListComponent implements OnInit {
  private readonly promoService = inject(PromoService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  columns = ['code', 'discount', 'usage', 'validity', 'status', 'actions'];
  dataSource = new MatTableDataSource<PromoCode>();

  ngOnInit(): void {
    this.loadPromos();
  }

  loadPromos(): void {
    this.promoService.getPromos().subscribe((promos) => {
      this.dataSource.data = promos;
    });
  }

  openForm(promo?: PromoCode): void {
    const dialogRef = this.dialog.open(PromoFormDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: { promo },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.loadPromos();
    });
  }

  deletePromo(promo: PromoCode): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Promo',
        message: `Delete promo code "${promo.code}"?`,
        confirmText: 'Delete',
        confirmColor: 'warn',
      },
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.promoService.deletePromo(promo.id).subscribe({
          next: () => {
            this.snackBar.open('Promo deleted', 'Close', { duration: 3000 });
            this.loadPromos();
          },
        });
      }
    });
  }
}
