import prisma from '../../config/database';
import { Tenant } from '../tenant/tenant.types';
import { ShopifyClient } from '../shopify/client';
import { IngestionResult, OrderIngestion } from './types';

class OrderIngestionService implements OrderIngestion {
  async ingestOrders(tenant: Tenant, client: ShopifyClient): Promise<IngestionResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let recordsProcessed = 0;

    try {
      let hasMore = true;
      let pageInfo: string | null = null;

      while (hasMore) {
        const params: any = { limit: 250, status: 'any' };
        if (pageInfo) {
          params.page_info = pageInfo;
        }

        const response = await client.get('/orders.json', params);
        const orders = response.orders || [];

        for (const order of orders) {
          try {
            // Check if order already exists
            const existing = await prisma.order.findUnique({
              where: { id: String(order.id) },
            });

            if (existing) {
              continue; // Skip duplicate
            }

            // Check if customer exists
            let customerId: string | null = null;
            if (order.customer?.id) {
              const customer = await prisma.customer.findUnique({
                where: { id: String(order.customer.id) },
              });
              customerId = customer ? String(order.customer.id) : null;
            }

            await prisma.order.create({
              data: {
                id: String(order.id),
                tenantId: tenant.id,
                customerId,
                totalPrice: parseFloat(order.total_price || '0'),
                currency: order.currency || 'USD',
                orderNumber: order.order_number ? String(order.order_number) : null,
                createdAt: new Date(order.created_at),
              },
            });
            recordsProcessed++;
          } catch (error) {
            errors.push(`Failed to insert order ${order.id}: ${error}`);
          }
        }

        // Check for pagination
        const linkHeader = response.headers?.link;
        if (linkHeader && linkHeader.includes('rel="next"')) {
          const nextMatch = linkHeader.match(/page_info=([^&>]+)/);
          pageInfo = nextMatch ? nextMatch[1] : null;
          hasMore = !!pageInfo;
        } else {
          hasMore = false;
        }
      }

      const duration = Date.now() - startTime;
      console.log(`Ingested ${recordsProcessed} orders for tenant ${tenant.shopName} in ${duration}ms`);

      return {
        success: errors.length === 0,
        recordsProcessed,
        errors,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      errors.push(`Order ingestion failed: ${error}`);
      
      return {
        success: false,
        recordsProcessed,
        errors,
        duration,
      };
    }
  }
}

export const orderIngestionService = new OrderIngestionService();
