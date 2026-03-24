import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderStatus } from '../../../models/order.model';

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  pending: { label: 'Pending', class: 'badge--warning' },
  waiting_payment: { label: 'Waiting Payment', class: 'badge--info' },
  paid: { label: 'Paid', class: 'badge--success' },
  processing: { label: 'Processing', class: 'badge--primary' },
  shipped: { label: 'Shipped', class: 'badge--primary' },
  completed: { label: 'Completed', class: 'badge--success' },
  cancelled: { label: 'Cancelled', class: 'badge--danger' },
  active: { label: 'Active', class: 'badge--success' },
  inactive: { label: 'Inactive', class: 'badge--danger' },
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="config.class">{{ config.label }}</span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
    }
    .badge--success { background: #e8f5e9; color: #2e7d32; }
    .badge--warning { background: #fff8e1; color: #f57f17; }
    .badge--danger  { background: #fce4ec; color: #c62828; }
    .badge--info    { background: #e3f2fd; color: #1565c0; }
    .badge--primary { background: #fce4e5; color: #B8262F; }
  `],
})
export class StatusBadgeComponent {
  @Input() set status(value: string) {
    this.config = STATUS_CONFIG[value] ?? { label: value, class: 'badge--info' };
  }

  config: { label: string; class: string } = { label: '', class: '' };
}
