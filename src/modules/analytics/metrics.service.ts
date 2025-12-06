import prisma from '../../config/database';
import {
  DashboardMetrics,
  TopCustomer,
  OrdersByDate,
  MetricsService as IMetricsService,
} from './types';

class MetricsServiceImpl implements IMetricsService {
  async getDashboardMetrics(tenantId: string): Promise<DashboardMetrics> {
    // Get total customers
    const totalCustomers = await prisma.customer.count({
      where: { tenantId },
    });

    // Get total orders
    const totalOrders = await prisma.order.count({
      where: { tenantId },
    });

    // Get total revenue
    const revenueResult = await prisma.order.aggregate({
      where: { tenantId },
      _sum: {
        totalPrice: true,
      },
    });
    const totalRevenue = revenueResult._sum.totalPrice || 0;

    // Get top customers
    const topCustomers = await this.getTopCustomers(tenantId, 5);

    return {
      totalCustomers,
      totalOrders,
      totalRevenue,
      topCustomers,
    };
  }

  async getTopCustomers(tenantId: string, limit: number): Promise<TopCustomer[]> {
    const result = await prisma.order.groupBy({
      by: ['customerId'],
      where: {
        tenantId,
        customerId: { not: null },
      },
      _sum: {
        totalPrice: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          totalPrice: 'desc',
        },
      },
      take: limit,
    });

    const topCustomers: TopCustomer[] = [];

    for (const item of result) {
      if (!item.customerId) continue;

      const customer = await prisma.customer.findUnique({
        where: { id: item.customerId },
      });

      if (customer) {
        topCustomers.push({
          customerId: customer.id,
          customerName: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unknown',
          customerEmail: customer.email,
          totalRevenue: item._sum.totalPrice || 0,
          orderCount: item._count.id,
        });
      }
    }

    return topCustomers;
  }

  async getOrdersByDateRange(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<OrdersByDate[]> {
    const orders = await prisma.order.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        createdAt: true,
        totalPrice: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by date
    const groupedByDate = new Map<string, { count: number; revenue: number }>();

    for (const order of orders) {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      const existing = groupedByDate.get(dateKey) || { count: 0, revenue: 0 };
      
      groupedByDate.set(dateKey, {
        count: existing.count + 1,
        revenue: existing.revenue + order.totalPrice,
      });
    }

    const result: OrdersByDate[] = [];
    for (const [date, data] of groupedByDate.entries()) {
      result.push({
        date,
        orderCount: data.count,
        revenue: data.revenue,
      });
    }

    return result;
  }
}

export const metricsService = new MetricsServiceImpl();
