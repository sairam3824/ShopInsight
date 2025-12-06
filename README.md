# Shopify Multi-Tenant Dashboard

A multi-tenant Shopify data ingestion and insights dashboard system that enables multiple Shopify store owners to connect their stores, automatically sync data, and view analytics through a web-based dashboard.

## Features

- **OAuth Authentication**: Secure Shopify store connection via OAuth 2.0
- **Multi-Tenant Architecture**: Complete data isolation between tenants
- **Automated Data Sync**: Periodic syncing of customers, orders, and products
- **Real-time Webhooks**: Instant updates for order and customer events
- **Analytics Dashboard**: Comprehensive metrics and insights
- **Secure by Design**: Encryption at rest, password hashing, session management

## Tech Stack

**Backend:**
- Node.js with TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- Shopify API

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Recharts for charts
- Axios for API calls

**Security:**
- AES-256 encryption for access tokens
- bcrypt for password hashing
- HMAC-SHA256 for webhook verification
- Helmet.js for security headers

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Shopify Partner Account (for API credentials)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd shopify-multi-tenant-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/shopify_dashboard"
SHOPIFY_API_VERSION="2024-01"
SHOPIFY_API_KEY="your_shopify_api_key"
SHOPIFY_API_SECRET="your_shopify_api_secret"
SESSION_SECRET="your_session_secret_min_32_chars"
WEBHOOK_SECRET="your_webhook_secret"
ENCRYPTION_KEY="your_encryption_key_32_chars"
PORT=3000
NODE_ENV="development"
```

4. Set up the database:
```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Start the backend development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

6. Start the frontend (in a new terminal):
```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:3001`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `SHOPIFY_API_VERSION` | Shopify API version (e.g., 2024-01) | Yes |
| `SHOPIFY_API_KEY` | Shopify API key from Partner Dashboard | Yes |
| `SHOPIFY_API_SECRET` | Shopify API secret from Partner Dashboard | Yes |
| `SESSION_SECRET` | Secret for session token generation (min 32 chars) | Yes |
| `WEBHOOK_SECRET` | Secret for webhook signature verification | Yes |
| `ENCRYPTION_KEY` | Key for encrypting access tokens (32 chars) | Yes |
| `PORT` | Server port | No (default: 3000) |
| `NODE_ENV` | Environment (development/production) | No (default: development) |
| `FRONTEND_URL` | Frontend URL for CORS | No (default: http://localhost:3001) |

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/session` - Validate session

### Shopify OAuth

- `GET /api/shopify/auth?shop=<shop_name>` - Initiate OAuth flow
- `GET /api/shopify/callback?code=<code>&shop=<shop>` - OAuth callback

### Analytics (Requires Authentication)

- `GET /api/analytics/summary` - Dashboard metrics
- `GET /api/analytics/top-customers?limit=5` - Top customers by revenue
- `GET /api/analytics/orders?from=<date>&to=<date>` - Orders by date range

### Webhooks

- `POST /webhooks/orders/create` - Order creation webhook
- `POST /webhooks/orders/update` - Order update webhook
- `POST /webhooks/customers/create` - Customer creation webhook

## Database Schema

The system uses the following main entities:

- **Tenant**: Shopify store with encrypted access token
- **Customer**: Customer records with tenant isolation
- **Order**: Order records with customer relationships
- **Product**: Product catalog with pricing
- **User**: Dashboard users with password hashing
- **Session**: User sessions with expiration

## Development Workflow

1. Make changes to the code
2. Run linting: `npm run lint`
3. Format code: `npm run format`
4. Build: `npm run build`
5. Run production: `npm start`

## Data Sync

The system automatically syncs data every 10 minutes. The sync process:

1. Fetches all registered tenants
2. For each tenant:
   - Syncs customers
   - Syncs orders
   - Syncs products
3. Continues with remaining tenants even if one fails

## Security Features

- **Access Token Encryption**: All Shopify access tokens encrypted with AES-256
- **Password Hashing**: User passwords hashed with bcrypt (cost factor 10)
- **Session Management**: Secure session tokens with 24-hour expiration
- **Webhook Verification**: HMAC-SHA256 signature verification
- **Rate Limiting**: 100 requests per minute per user
- **Security Headers**: Helmet.js for HTTP security headers
- **Tenant Isolation**: All queries filtered by tenant ID

## Error Handling

The system implements comprehensive error handling:

- Exponential backoff for API retries (max 5 attempts)
- Circuit breaker pattern for API failures
- Graceful degradation for partial failures
- Structured error responses with error codes
- Sensitive data sanitization in logs

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql $DATABASE_URL
```

### Prisma Issues
```bash
# Reset database
npm run prisma:migrate reset

# Regenerate client
npm run prisma:generate
```

### Shopify API Issues
- Verify API credentials in Shopify Partner Dashboard
- Check API version compatibility
- Review rate limit logs

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
