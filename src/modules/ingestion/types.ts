export interface IngestionResult {
  success: boolean;
  recordsProcessed: number;
  errors: string[];
  duration: number;
}

export interface CustomerIngestion {
  ingestCustomers(tenant: any, client: any): Promise<IngestionResult>;
}

export interface OrderIngestion {
  ingestOrders(tenant: any, client: any): Promise<IngestionResult>;
}

export interface ProductIngestion {
  ingestProducts(tenant: any, client: any): Promise<IngestionResult>;
}
