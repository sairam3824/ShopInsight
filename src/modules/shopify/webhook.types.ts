export interface WebhookPayload {
  id: string;
  [key: string]: any;
}

export interface WebhookHandler {
  verifySignature(body: string, signature: string): boolean;
  handleOrderCreate(payload: WebhookPayload, shopDomain: string): Promise<void>;
  handleOrderUpdate(payload: WebhookPayload, shopDomain: string): Promise<void>;
  handleCustomerCreate(payload: WebhookPayload, shopDomain: string): Promise<void>;
}
