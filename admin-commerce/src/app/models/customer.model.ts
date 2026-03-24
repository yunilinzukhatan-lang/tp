export interface Customer {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    role: string;
    is_active: boolean;
  };
  addresses?: CustomerAddress[];
}

export interface CustomerAddress {
  id: string;
  customer_id: string;
  label: string;
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
}

export interface CustomerListResponse {
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
