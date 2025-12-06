import prisma from '../../config/database';
import { Tenant } from '../tenant/tenant.types';
import { ShopifyClient } from '../shopify/client';
import { IngestionResult, CustomerIngestion } from './types';

class CustomerIngestionService implements CustomerIngestion {
  async ingestCustomers(tenant: Tenant, client: ShopifyClient): Promise<IngestionResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let recordsProcessed = 0;

    try {
      let hasMore = true;
      let pageInfo: string | null = null;

      while (hasMore) {
        const params: any = { limit: 250 };
        if (pageInfo) {
          params.page_info = pageInfo;
        }

        const response = await client.get('/customers.json', params);
        const customers = response.customers || [];

        for (const customer of customers) {
          try {
            await prisma.customer.upsert({
              where: { id: String(customer.id) },
              update: {
                email: customer.email || '',
                firstName: customer.first_name,
                lastName: customer.last_name,
                updatedAt: new Date(),
              },
              create: {
                id: String(customer.id),
                tenantId: tenant.id,
                email: customer.email || '',
                firstName: customer.first_name,
                lastName: customer.last_name,
              },
            });
            recordsProcessed++;
          } catch (error) {
            errors.push(`Failed to upsert customer ${customer.id}: ${error}`);
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
      console.log(`Ingested ${recordsProcessed} customers for tenant ${tenant.shopName} in ${duration}ms`);

      return {
        success: errors.length === 0,
        recordsProcessed,
        errors,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      errors.push(`Customer ingestion failed: ${error}`);
      
      return {
        success: false,
        recordsProcessed,
        errors,
        duration,
      };
    }
  }
}

export const customerIngestionService = new CustomerIngestionService();
