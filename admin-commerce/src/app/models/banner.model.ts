export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  link_url?: string;
  is_active: boolean;
  sort_order: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBannerRequest {
  title: string;
  subtitle?: string;
  image_url: string;
  link_url?: string;
  is_active: boolean;
  sort_order?: number;
  start_date?: string;
  end_date?: string;
}

export interface UpdateBannerRequest {
  title?: string;
  subtitle?: string;
  image_url?: string;
  link_url?: string;
  is_active?: boolean;
  sort_order?: number;
  start_date?: string;
  end_date?: string;
}
