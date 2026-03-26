import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { PointService, PointsResponse } from '../../services/point.service';

@Component({
  selector: 'app-points',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
  ],
  template: `
    <app-page-header
      title="Loyalty Points"
      subtitle="Award points to customers based on their purchase value (price ÷ 10 000 = points)">
    </app-page-header>

    <div class="points-layout">
      <!-- Award Points Form -->
      <mat-card class="form-card">
        <mat-card-header>
          <mat-icon mat-card-avatar class="card-icon">stars</mat-icon>
          <mat-card-title>Award Points</mat-card-title>
          <mat-card-subtitle>Enter the customer phone number and purchase price</mat-card-subtitle>
        </mat-card-header>

        <mat-divider></mat-divider>

        <mat-card-content class="form-content">
          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field appearance="outline" class="field">
              <mat-label>Customer Phone Number</mat-label>
              <input matInput formControlName="phoneNumber" type="tel" placeholder="e.g. 08123456789" />
              <mat-icon matPrefix>phone</mat-icon>
              @if (form.get('phoneNumber')?.hasError('required') && form.get('phoneNumber')?.touched) {
                <mat-error>Phone number is required</mat-error>
              }
              @if (form.get('phoneNumber')?.hasError('minlength') && form.get('phoneNumber')?.touched) {
                <mat-error>Phone number must be at least 6 characters</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="field">
              <mat-label>Purchase Price (IDR)</mat-label>
              <input matInput formControlName="price" type="number" min="1" placeholder="e.g. 150000" />
              <mat-icon matPrefix>payments</mat-icon>
              <mat-hint>Points = price ÷ 10 000 (rounded down)</mat-hint>
              @if (form.get('price')?.hasError('required') && form.get('price')?.touched) {
                <mat-error>Price is required</mat-error>
              }
              @if (form.get('price')?.hasError('min') && form.get('price')?.touched) {
                <mat-error>Price must be greater than 0</mat-error>
              }
            </mat-form-field>

            @if (previewPoints() !== null) {
              <div class="preview-badge">
                <mat-icon>auto_awesome</mat-icon>
                <span>
                  This transaction will award
                  <strong>{{ previewPoints() }} point{{ previewPoints() !== 1 ? 's' : '' }}</strong>
                </span>
              </div>
            }

            <mat-form-field appearance="outline" class="field">
              <mat-label>Note (optional)</mat-label>
              <input matInput formControlName="note" placeholder="e.g. Birthday bonus, in-store purchase..." />
              <mat-icon matPrefix>note</mat-icon>
            </mat-form-field>

            <div class="form-actions">
              <button
                mat-flat-button
                color="primary"
                type="submit"
                [disabled]="loading()">
                @if (loading()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  <span><mat-icon>add_circle</mat-icon> Award Points</span>
                }
              </button>
              <button mat-stroked-button type="button" (click)="resetForm()" [disabled]="loading()">
                Clear
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Result Card -->
      @if (result()) {
        <mat-card class="result-card">
          <mat-card-header>
            <mat-icon mat-card-avatar class="result-icon">verified</mat-icon>
            <mat-card-title>Points Awarded</mat-card-title>
            <mat-card-subtitle>Transaction recorded successfully</mat-card-subtitle>
          </mat-card-header>

          <mat-divider></mat-divider>

          <mat-card-content class="result-content">
            <div class="result-row">
              <span class="result-label">Customer</span>
              <span class="result-value">{{ result()!.phone_number }}</span>
            </div>
            <div class="result-row result-row--highlight">
              <span class="result-label">Total Points</span>
              <span class="result-value result-points">{{ result()!.total_points }}</span>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .points-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      align-items: start;
    }

    @media (max-width: 900px) {
      .points-layout { grid-template-columns: 1fr; }
    }

    .form-card, .result-card {
      border-radius: 12px !important;
    }

    .card-icon {
      background: #1a1a2e;
      color: #fff;
      border-radius: 8px;
      padding: 6px;
      font-size: 20px;
    }

    .form-content {
      padding-top: 20px !important;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .field {
      width: 100%;
    }

    .preview-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #e8f5e9;
      border: 1px solid #a5d6a7;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 14px;
      color: #2e7d32;
      margin: 4px 0;

      mat-icon { font-size: 18px; width: 18px; height: 18px; color: #2e7d32; }
      strong { font-weight: 700; }
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 8px;
      align-items: center;

      button[mat-flat-button] {
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 140px;
        justify-content: center;
      }
    }

    .result-content {
      padding-top: 20px !important;
    }

    .result-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child { border-bottom: none; }
    }

    .result-row--highlight {
      background: #fff8e1;
      margin: 0 -16px;
      padding: 12px 16px;
      border-radius: 8px;
    }

    .result-label {
      font-size: 13px;
      color: #666;
      font-weight: 500;
    }

    .result-value {
      font-size: 14px;
      font-weight: 600;
      color: #1a1a2e;
    }

    .result-points {
      font-size: 28px;
      font-weight: 800;
      color: #B8262F;
    }

    .result-icon {
      background: #B8262F;
      color: #fff;
      border-radius: 8px;
      padding: 6px;
      font-size: 20px;
    }
  `],
})
export class PointsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly pointService = inject(PointService);
  private readonly snackBar = inject(MatSnackBar);

  loading = signal(false);
  result = signal<PointsResponse | null>(null);
  previewPoints = signal<number | null>(null);

  form = this.fb.group({
    phoneNumber: ['', [Validators.required, Validators.minLength(6)]],
    price: [null as number | null, [Validators.required, Validators.min(1)]],
    note: [''],
  });

  constructor() {
    this.form.get('price')?.valueChanges.subscribe((val) => {
      if (val && val > 0) {
        this.previewPoints.set(Math.floor(val / 10_000));
      } else {
        this.previewPoints.set(null);
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.result.set(null);

    const { phoneNumber, price, note } = this.form.value;

    this.pointService.addPoints({
      phone_number: phoneNumber!,
      price: price!,
      note: note || undefined,
    }).subscribe({
      next: (res) => {
        this.result.set(res);
        this.loading.set(false);
        this.snackBar.open(
          `${Math.floor(price! / 10_000)} point(s) awarded to ${phoneNumber}`,
          'OK',
          { duration: 4000, panelClass: 'snack-success' },
        );
      },
      // Error display is handled globally by errorInterceptor (snackbar + detail from backend).
      // Only reset loading state here.
      error: () => this.loading.set(false),
    });
  }

  resetForm(): void {
    this.form.reset();
    this.result.set(null);
    this.previewPoints.set(null);
  }
}
