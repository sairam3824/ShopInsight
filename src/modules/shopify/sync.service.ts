import cron from 'node-cron';
import { tenantService } from '../tenant/tenant.service';
import { getShopifyClient } from './client';
import { customerIngestionService } from '../ingestion/customers.ingest';
import { orderIngestionService } from '../ingestion/orders.ingest';
import { productIngestionService } from '../ingestion/products.ingest';
import { Tenant } from '../tenant/tenant.types';

export interface SyncService {
  syncTenantData(tenant: Tenant): Promise<void>;
  syncAllTenants(): Promise<void>;
  startScheduledSync(intervalMinutes: number): void;
  stopScheduledSync(): void;
}

class SyncServiceImpl implements SyncService {
  private cronJob: cron.ScheduledTask | null = null;

  async syncTenantData(tenant: Tenant): Promise<void> {
    console.log(`Starting sync for tenant: ${tenant.shopName}`);
    
    try {
      const client = getShopifyClient(tenant);

      // Ingest in order: customers, orders, products
      console.log(`Ingesting customers for ${tenant.shopName}`);
      const customerResult = await customerIngestionService.ingestCustomers(tenant, client);
      console.log(`Customer ingestion result:`, customerResult);

      console.log(`Ingesting orders for ${tenant.shopName}`);
      const orderResult = await orderIngestionService.ingestOrders(tenant, client);
      console.log(`Order ingestion result:`, orderResult);

      console.log(`Ingesting products for ${tenant.shopName}`);
      const productResult = await productIngestionService.ingestProducts(tenant, client);
      console.log(`Product ingestion result:`, productResult);

      console.log(`Completed sync for tenant: ${tenant.shopName}`);
    } catch (error) {
      console.error(`Failed to sync tenant ${tenant.shopName}:`, error);
      throw error;
    }
  }

  async syncAllTenants(): Promise<void> {
    console.log('Starting sync for all tenants');
    const startTime = Date.now();

    try {
      const tenants = await tenantService.getAllTenants();
      console.log(`Found ${tenants.length} tenants to sync`);

      for (const tenant of tenants) {
        try {
          await this.syncTenantData(tenant);
        } catch (error) {
          console.error(`Sync failed for tenant ${tenant.shopName}, continuing with next tenant:`, error);
          // Continue with remaining tenants
        }
      }

      const duration = Date.now() - startTime;
      console.log(`Completed sync for all tenants in ${duration}ms`);
    } catch (error) {
      console.error('Failed to sync all tenants:', error);
      throw error;
    }
  }

  startScheduledSync(intervalMinutes: number): void {
    if (this.cronJob) {
      console.log('Sync service already running');
      return;
    }

    // Run every N minutes
    const cronExpression = `*/${intervalMinutes} * * * *`;
    
    this.cronJob = cron.schedule(cronExpression, async () => {
      console.log(`Scheduled sync triggered at ${new Date().toISOString()}`);
      try {
        await this.syncAllTenants();
      } catch (error) {
        console.error('Scheduled sync failed:', error);
      }
    });

    console.log(`Sync service started with ${intervalMinutes} minute interval`);
  }

  stopScheduledSync(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      console.log('Sync service stopped');
    }
  }
}

export const syncService = new SyncServiceImpl();
