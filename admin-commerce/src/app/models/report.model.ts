export interface TopProduct {
  product_id: string;
  product_name: string;
  total_sold: number;
  revenue: string;
}

export interface SalesReport {
  total_orders: number;
  total_revenue: string;
  average_order: string;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  top_products: TopProduct[];
  start_date: string;
  end_date: string;
}

export interface ReportFilter {
  start_date: string;
  end_date: string;
}
