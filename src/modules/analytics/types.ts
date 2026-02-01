export interface DashboardMetrics {
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  topCustomers: TopCustomer[];
  topProducts: TopProduct[];
}

export interface TopProduct {
  productId: string;
  productTitle: string;
  vendor: string;
  price: number;
}

export interface TopCustomer {
  customerId: string;
  customerName: string;
  customerEmail: string;
  totalRevenue: number;
  orderCount: number;
}

export interface OrdersByDate {
  date: string;
  orderCount: number;
  revenue: number;
}

export interface MetricsService {
  getDashboardMetrics(tenantId: string): Promise<DashboardMetrics>;
  getTopCustomers(tenantId: string, limit: number): Promise<TopCustomer[]>;
  getTopProducts(tenantId: string, limit: number): Promise<TopProduct[]>;
  getOrdersByDateRange(tenantId: string, startDate: Date, endDate: Date): Promise<OrdersByDate[]>;
}
