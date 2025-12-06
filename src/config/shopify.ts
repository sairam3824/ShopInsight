import { CONFIG } from './env';

export const shopifyConfig = {
  apiVersion: CONFIG.SHOPIFY_API_VERSION,
  apiKey: CONFIG.SHOPIFY_API_KEY,
  apiSecret: CONFIG.SHOPIFY_API_SECRET,
  scopes: ['read_customers', 'read_orders', 'read_products'],
  hostName: process.env.HOST_NAME || 'localhost:3000',
  isEmbeddedApp: false,
};

export default shopifyConfig;
