export type OrderStatus =
  | 'pending'
  | 'waiting_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'completed'
  | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  product_price: string;
  quantity: number;
  total_price: string;
  created_at: string;
}

export interface OrderAddress {
  id: string;
  label: string;
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  province: string;
  postal_code: string;
}

export interface Order {
  id: string;
  customer_id: string;
  address_id: string;
  promo_code_id?: string;
  order_number: string;
  status: OrderStatus;
  sub_total: string;
  discount_amount: string;
  shipping_cost: string;
  total_amount: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  customer?: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    user?: { email: string };
  };
  address?: OrderAddress;
  items?: OrderItem[];
  payment?: {
    id: string;
    status: string;
    payment_method: string;
    amount: string;
    paid_at?: string;
  };
}

export interface OrderListResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  notes?: string;
}

export interface OrderListFilter {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  start_date?: string;
  end_date?: string;
}
