import crypto from 'crypto';
import prisma from '../../config/database';
import { CONFIG } from '../../config/env';
import { tenantService } from '../tenant/tenant.service';
import { WebhookPayload, WebhookHandler as IWebhookHandler } from './webhook.types';

class WebhookHandlerImpl implements IWebhookHandler {
  verifySignature(body: string, signature: string): boolean {
    const hmac = crypto
      .createHmac('sha256', CONFIG.WEBHOOK_SECRET)
      .update(body, 'utf8')
      .digest('base64');

    return hmac === signature;
  }

  async handleOrderCreate(payload: WebhookPayload, shopDomain: string): Promise<void> {
    console.log(`Handling order create webhook for shop: ${shopDomain}`);

    const tenant = await tenantService.getTenantByShopName(shopDomain);
    if (!tenant) {
      throw new Error(`Tenant not found for shop: ${shopDomain}`);
    }

    // Check if customer exists
    let customerId: string | null = null;
    if (payload.customer?.id) {
      const customer = await prisma.customer.findUnique({
        where: { id: String(payload.customer.id) },
      });
      customerId = customer ? String(payload.customer.id) : null;
    }

    // Check if order already exists
    const existing = await prisma.order.findUnique({
      where: { id: String(payload.id) },
    });

    if (existing) {
      console.log(`Order ${payload.id} already exists, skipping`);
      return;
    }

    await prisma.order.create({
      data: {
        id: String(payload.id),
        tenantId: tenant.id,
        customerId,
        totalPrice: parseFloat(payload.total_price || '0'),
        currency: payload.currency || 'USD',
        orderNumber: payload.order_number ? String(payload.order_number) : null,
        createdAt: new Date(payload.created_at),
      },
    });

    console.log(`Order ${payload.id} created successfully`);
  }

  async handleOrderUpdate(payload: WebhookPayload, shopDomain: string): Promise<void> {
    console.log(`Handling order update webhook for shop: ${shopDomain}`);

    const tenant = await tenantService.getTenantByShopName(shopDomain);
    if (!tenant) {
      throw new Error(`Tenant not found for shop: ${shopDomain}`);
    }

    // Check if customer exists
    let customerId: string | null = null;
    if (payload.customer?.id) {
      const customer = await prisma.customer.findUnique({
        where: { id: String(payload.customer.id) },
      });
      customerId = customer ? String(payload.customer.id) : null;
    }

    await prisma.order.upsert({
      where: { id: String(payload.id) },
      update: {
        customerId,
        totalPrice: parseFloat(payload.total_price || '0'),
        currency: payload.currency || 'USD',
        orderNumber: payload.order_number ? String(payload.order_number) : null,
        updatedAt: new Date(),
      },
      create: {
        id: String(payload.id),
        tenantId: tenant.id,
        customerId,
        totalPrice: parseFloat(payload.total_price || '0'),
        currency: payload.currency || 'USD',
        orderNumber: payload.order_number ? String(payload.order_number) : null,
        createdAt: new Date(payload.created_at),
      },
    });

    console.log(`Order ${payload.id} updated successfully`);
  }

  async handleCustomerCreate(payload: WebhookPayload, shopDomain: string): Promise<void> {
    console.log(`Handling customer create webhook for shop: ${shopDomain}`);

    const tenant = await tenantService.getTenantByShopName(shopDomain);
    if (!tenant) {
      throw new Error(`Tenant not found for shop: ${shopDomain}`);
    }

    await prisma.customer.upsert({
      where: { id: String(payload.id) },
      update: {
        email: payload.email || '',
        firstName: payload.first_name,
        lastName: payload.last_name,
        updatedAt: new Date(),
      },
      create: {
        id: String(payload.id),
        tenantId: tenant.id,
        email: payload.email || '',
        firstName: payload.first_name,
        lastName: payload.last_name,
      },
    });

    console.log(`Customer ${payload.id} created successfully`);
  }
}

export const webhookHandler = new WebhookHandlerImpl();
