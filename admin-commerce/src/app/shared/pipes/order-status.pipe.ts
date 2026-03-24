import { Pipe, PipeTransform } from '@angular/core';
import { OrderStatus } from '../../models/order.model';

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  waiting_payment: 'Waiting Payment',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

@Pipe({ name: 'orderStatus', standalone: true })
export class OrderStatusPipe implements PipeTransform {
  transform(status: OrderStatus | string): string {
    return STATUS_LABELS[status as OrderStatus] ?? status;
  }
}
