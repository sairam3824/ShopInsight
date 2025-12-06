export interface Config {
  DATABASE_URL: string;
  SHOPIFY_API_VERSION: string;
  SHOPIFY_API_KEY: string;
  SHOPIFY_API_SECRET: string;
  SESSION_SECRET: string;
  WEBHOOK_SECRET: string;
  ENCRYPTION_KEY: string;
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
}

function validateEnv(): Config {
  const required = [
    'DATABASE_URL',
    'SHOPIFY_API_VERSION',
    'SHOPIFY_API_KEY',
    'SHOPIFY_API_SECRET',
    'SESSION_SECRET',
    'WEBHOOK_SECRET',
    'ENCRYPTION_KEY',
  ];

  const missing = required.filter((key) => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    SHOPIFY_API_VERSION: process.env.SHOPIFY_API_VERSION!,
    SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY!,
    SHOPIFY_API_SECRET: process.env.SHOPIFY_API_SECRET!,
    SESSION_SECRET: process.env.SESSION_SECRET!,
    WEBHOOK_SECRET: process.env.WEBHOOK_SECRET!,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY!,
    PORT: parseInt(process.env.PORT || '3000', 10),
    NODE_ENV: (process.env.NODE_ENV as Config['NODE_ENV']) || 'development',
  };
}

export const CONFIG = validateEnv();
