export type PromoType = 'percentage' | 'fixed';

export interface PromoCode {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: PromoType;
  value: string;
  min_purchase: string;
  max_discount: string;
  usage_limit: number;
  used_count: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePromoRequest {
  code: string;
  name: string;
  description?: string;
  type: PromoType;
  value: number;
  min_purchase?: number;
  max_discount?: number;
  usage_limit?: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface UpdatePromoRequest {
  code?: string;
  name?: string;
  description?: string;
  type?: PromoType;
  value?: number;
  min_purchase?: number;
  max_discount?: number;
  usage_limit?: number;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
}
