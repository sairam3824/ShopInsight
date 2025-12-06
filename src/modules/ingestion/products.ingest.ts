import prisma from '../../config/database';
import { Tenant } from '../tenant/tenant.types';
import { ShopifyClient } from '../shopify/client';
import { IngestionResult, ProductIngestion } from './types';

class ProductIngestionService implements ProductIngestion {
  async ingestProducts(tenant: Tenant, client: ShopifyClient): Promise<IngestionResult> {
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

        const response = await client.get('/products.json', params);
        const products = response.products || [];

        for (const product of products) {
          try {
            // Get price from first variant
            let price: number | null = null;
            if (product.variants && product.variants.length > 0) {
              const firstVariant = product.variants[0];
              price = firstVariant.price ? parseFloat(firstVariant.price) : null;
            }

            await prisma.product.upsert({
              where: { id: String(product.id) },
              update: {
                title: product.title,
                price,
                vendor: product.vendor,
                updatedAt: new Date(),
              },
              create: {
                id: String(product.id),
                tenantId: tenant.id,
                title: product.title,
                price,
                vendor: product.vendor,
              },
            });
            recordsProcessed++;
          } catch (error) {
            errors.push(`Failed to upsert product ${product.id}: ${error}`);
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
      console.log(`Ingested ${recordsProcessed} products for tenant ${tenant.shopName} in ${duration}ms`);

      return {
        success: errors.length === 0,
        recordsProcessed,
        errors,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      errors.push(`Product ingestion failed: ${error}`);
      
      return {
        success: false,
        recordsProcessed,
        errors,
        duration,
      };
    }
  }
}

export const productIngestionService = new ProductIngestionService();
