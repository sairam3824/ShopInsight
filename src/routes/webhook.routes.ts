import { Router, Request, Response } from 'express';
import { webhookHandler } from '../modules/shopify/webhook.handler';

const router = Router();

// Middleware to get raw body for signature verification
function getRawBody(req: Request, _res: Response, next: Function) {
  let data = '';
  req.setEncoding('utf8');
  
  req.on('data', (chunk) => {
    data += chunk;
  });

  req.on('end', () => {
    (req as any).rawBody = data;
    next();
  });
}

// POST /webhooks/orders/create
router.post('/orders/create', getRawBody, async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-shopify-hmac-sha256'] as string;
    const shopDomain = req.headers['x-shopify-shop-domain'] as string;
    const rawBody = (req as any).rawBody;

    if (!signature) {
      res.status(401).json({
        error: {
          code: 'WEBHOOK_MISSING_SIGNATURE',
          message: 'Missing webhook signature',
        },
      });
      return;
    }

    if (!shopDomain) {
      res.status(400).json({
        error: {
          code: 'WEBHOOK_MISSING_SHOP',
          message: 'Missing shop domain header',
        },
      });
      return;
    }

    // Verify signature
    const isValid = webhookHandler.verifySignature(rawBody, signature);
    
    if (!isValid) {
      console.error('Invalid webhook signature');
      res.status(401).json({
        error: {
          code: 'WEBHOOK_INVALID_SIGNATURE',
          message: 'Invalid webhook signature',
        },
      });
      return;
    }

    // Parse payload
    const payload = JSON.parse(rawBody);

    // Handle order create
    await webhookHandler.handleOrderCreate(payload, shopDomain);

    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook order create error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to process webhook',
      },
    });
  }
});

// POST /webhooks/orders/update
router.post('/orders/update', getRawBody, async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-shopify-hmac-sha256'] as string;
    const shopDomain = req.headers['x-shopify-shop-domain'] as string;
    const rawBody = (req as any).rawBody;

    if (!signature) {
      res.status(401).json({
        error: {
          code: 'WEBHOOK_MISSING_SIGNATURE',
          message: 'Missing webhook signature',
        },
      });
      return;
    }

    if (!shopDomain) {
      res.status(400).json({
        error: {
          code: 'WEBHOOK_MISSING_SHOP',
          message: 'Missing shop domain header',
        },
      });
      return;
    }

    // Verify signature
    const isValid = webhookHandler.verifySignature(rawBody, signature);
    
    if (!isValid) {
      console.error('Invalid webhook signature');
      res.status(401).json({
        error: {
          code: 'WEBHOOK_INVALID_SIGNATURE',
          message: 'Invalid webhook signature',
        },
      });
      return;
    }

    // Parse payload
    const payload = JSON.parse(rawBody);

    // Handle order update
    await webhookHandler.handleOrderUpdate(payload, shopDomain);

    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook order update error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to process webhook',
      },
    });
  }
});

// POST /webhooks/customers/create
router.post('/customers/create', getRawBody, async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-shopify-hmac-sha256'] as string;
    const shopDomain = req.headers['x-shopify-shop-domain'] as string;
    const rawBody = (req as any).rawBody;

    if (!signature) {
      res.status(401).json({
        error: {
          code: 'WEBHOOK_MISSING_SIGNATURE',
          message: 'Missing webhook signature',
        },
      });
      return;
    }

    if (!shopDomain) {
      res.status(400).json({
        error: {
          code: 'WEBHOOK_MISSING_SHOP',
          message: 'Missing shop domain header',
        },
      });
      return;
    }

    // Verify signature
    const isValid = webhookHandler.verifySignature(rawBody, signature);
    
    if (!isValid) {
      console.error('Invalid webhook signature');
      res.status(401).json({
        error: {
          code: 'WEBHOOK_INVALID_SIGNATURE',
          message: 'Invalid webhook signature',
        },
      });
      return;
    }

    // Parse payload
    const payload = JSON.parse(rawBody);

    // Handle customer create
    await webhookHandler.handleCustomerCreate(payload, shopDomain);

    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook customer create error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to process webhook',
      },
    });
  }
});

export default router;
