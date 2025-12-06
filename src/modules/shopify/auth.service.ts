import crypto from 'crypto';
import { CONFIG } from '../../config/env';
import { shopifyConfig } from '../../config/shopify';

export interface AuthService {
  generateAuthUrl(shop: string, redirectUri: string): string;
  exchangeCodeForToken(shop: string, code: string): Promise<string>;
  validateShop(shop: string): boolean;
}

class ShopifyAuthService implements AuthService {
  generateAuthUrl(shop: string, redirectUri: string): string {
    if (!this.validateShop(shop)) {
      throw new Error('Invalid shop domain');
    }

    const scopes = shopifyConfig.scopes.join(',');
    const nonce = crypto.randomBytes(16).toString('hex');
    
    const params = new URLSearchParams({
      client_id: CONFIG.SHOPIFY_API_KEY,
      scope: scopes,
      redirect_uri: redirectUri,
      state: nonce,
    });

    return `https://${shop}/admin/oauth/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(shop: string, code: string): Promise<string> {
    if (!this.validateShop(shop)) {
      throw new Error('Invalid shop domain');
    }

    const url = `https://${shop}/admin/oauth/access_token`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: CONFIG.SHOPIFY_API_KEY,
        client_secret: CONFIG.SHOPIFY_API_SECRET,
        code,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to exchange code for token: ${response.statusText}`);
    }

    const data = await response.json() as { access_token: string };
    return data.access_token;
  }

  validateShop(shop: string): boolean {
    const shopRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;
    return shopRegex.test(shop);
  }
}

export const authService = new ShopifyAuthService();
