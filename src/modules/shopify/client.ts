import { Tenant } from '../tenant/tenant.types';
import { shopifyConfig } from '../../config/shopify';

export interface ShopifyClient {
  get(path: string, params?: Record<string, any>): Promise<any>;
  post(path: string, data: any): Promise<any>;
  put(path: string, data: any): Promise<any>;
  delete(path: string): Promise<any>;
}

class ShopifyRestClient implements ShopifyClient {
  private baseUrl: string;
  private accessToken: string;
  private retryCount = 0;
  private maxRetries = 5;
  private failureCount = 0;
  private circuitBreakerThreshold = 5;
  private circuitBreakerTimeout = 60000;
  private circuitOpen = false;
  private circuitOpenTime = 0;

  constructor(shopName: string, accessToken: string) {
    this.baseUrl = `https://${shopName}/admin/api/${shopifyConfig.apiVersion}`;
    this.accessToken = accessToken;
  }

  private async request(
    method: string,
    path: string,
    data?: any,
    params?: Record<string, any>
  ): Promise<any> {
    // Circuit breaker check
    if (this.circuitOpen) {
      const now = Date.now();
      if (now - this.circuitOpenTime < this.circuitBreakerTimeout) {
        throw new Error('Circuit breaker is open');
      }
      // Half-open state: allow one test request
      this.circuitOpen = false;
      this.failureCount = 0;
    }

    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.accessToken,
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url.toString(), options);

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : this.getBackoffDelay();
        
        console.log(`Rate limited. Retrying after ${delay}ms`);
        
        if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          await this.sleep(delay);
          return this.request(method, path, data, params);
        }
        
        throw new Error('Max retries exceeded for rate limiting');
      }

      // Handle other errors with exponential backoff
      if (!response.ok) {
        if (this.retryCount < this.maxRetries && this.isRetryableError(response.status)) {
          this.retryCount++;
          const delay = this.getBackoffDelay();
          await this.sleep(delay);
          return this.request(method, path, data, params);
        }

        this.failureCount++;
        if (this.failureCount >= this.circuitBreakerThreshold) {
          this.circuitOpen = true;
          this.circuitOpenTime = Date.now();
          console.error('Circuit breaker opened due to consecutive failures');
        }

        throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
      }

      // Reset counters on success
      this.retryCount = 0;
      this.failureCount = 0;

      return response.json();
    } catch (error) {
      this.failureCount++;
      if (this.failureCount >= this.circuitBreakerThreshold) {
        this.circuitOpen = true;
        this.circuitOpenTime = Date.now();
      }
      throw error;
    }
  }

  private isRetryableError(status: number): boolean {
    return status >= 500 || status === 408;
  }

  private getBackoffDelay(): number {
    const baseDelay = 1000;
    const maxDelay = 32000;
    const delay = Math.min(baseDelay * Math.pow(2, this.retryCount), maxDelay);
    return delay;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async get(path: string, params?: Record<string, any>): Promise<any> {
    return this.request('GET', path, undefined, params);
  }

  async post(path: string, data: any): Promise<any> {
    return this.request('POST', path, data);
  }

  async put(path: string, data: any): Promise<any> {
    return this.request('PUT', path, data);
  }

  async delete(path: string): Promise<any> {
    return this.request('DELETE', path);
  }
}

export function getShopifyClient(tenant: Tenant): ShopifyClient {
  return new ShopifyRestClient(tenant.shopName, tenant.accessToken);
}
