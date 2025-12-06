import { Router, Request, Response } from 'express';
import { authService } from '../modules/shopify/auth.service';
import { tenantService } from '../modules/tenant/tenant.service';
import { getShopifyClient } from '../modules/shopify/client';
import { customerIngestionService } from '../modules/ingestion/customers.ingest';
import { orderIngestionService } from '../modules/ingestion/orders.ingest';
import { productIngestionService } from '../modules/ingestion/products.ingest';

const router = Router();

// GET /api/shopify/auth?shop=<shop_name>
router.get('/auth', async (req: Request, res: Response) => {
  try {
    const { shop } = req.query;

    if (!shop || typeof shop !== 'string') {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Shop parameter is required',
        },
      });
      return;
    }

    if (!authService.validateShop(shop)) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_INVALID_SHOP',
          message: 'Invalid shop domain format',
        },
      });
      return;
    }

    const redirectUri = `${req.protocol}://${req.get('host')}/api/shopify/callback`;
    const authUrl = authService.generateAuthUrl(shop, redirectUri);

    res.redirect(authUrl);
  } catch (error) {
    console.error('OAuth initiation error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to initiate OAuth',
      },
    });
  }
});

// GET /api/shopify/callback?code=<code>&shop=<shop>
router.get('/callback', async (req: Request, res: Response) => {
  try {
    const { code, shop } = req.query;

    if (!code || !shop || typeof code !== 'string' || typeof shop !== 'string') {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Code and shop parameters are required',
        },
      });
      return;
    }

    // Exchange code for access token
    const accessToken = await authService.exchangeCodeForToken(shop, code);

    // Register tenant
    const tenant = await tenantService.registerTenant(shop, accessToken);

    // Trigger initial data ingestion
    console.log(`Starting initial ingestion for tenant: ${tenant.shopName}`);
    
    const client = getShopifyClient(tenant);

    // Run ingestion in background (don't await)
    Promise.all([
      customerIngestionService.ingestCustomers(tenant, client),
      orderIngestionService.ingestOrders(tenant, client),
      productIngestionService.ingestProducts(tenant, client),
    ])
      .then(() => {
        console.log(`Initial ingestion completed for tenant: ${tenant.shopName}`);
      })
      .catch((error) => {
        console.error(`Initial ingestion failed for tenant ${tenant.shopName}:`, error);
      });

    res.json({
      message: 'Shopify store connected successfully',
      tenantId: tenant.id,
      shopName: tenant.shopName,
    });
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    
    if (error.message?.includes('Failed to exchange code')) {
      res.status(400).json({
        error: {
          code: 'SHOPIFY_AUTH_FAILED',
          message: 'Failed to authenticate with Shopify',
        },
      });
      return;
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to complete OAuth',
      },
    });
  }
});

export default router;
