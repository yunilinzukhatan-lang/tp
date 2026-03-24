import { Category } from './category.model';

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text?: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  weight: string;
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  images?: ProductImage[];
}

export interface CreateProductRequest {
  category_id: string;
  name: string;
  slug?: string;
  description: string;
  price: number;
  weight: number;
  stock: number;
  is_active: boolean;
}

export interface UpdateProductRequest {
  category_id?: string;
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  weight?: number;
  stock?: number;
  is_active?: boolean;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ProductListFilter {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: string;
  is_active?: boolean;
  sort_by?: string;
  sort_order?: string;
}
