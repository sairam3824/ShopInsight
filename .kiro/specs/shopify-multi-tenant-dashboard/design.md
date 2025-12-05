# Design Document

## Overview

This document outlines the technical design for a multi-tenant Shopify data ingestion and insights dashboard system. The system enables multiple Shopify store owners to connect their stores via OAuth, automatically sync data (customers, orders, products) into a PostgreSQL database, and view analytics through a web-based dashboard.

The architecture follows a modular design pattern with clear separation of concerns across six primary modules: Shopify Integration, Tenant Management, Data Ingestion, Analytics, Authentication, and Webhook Handling. The system uses Node.js with Express for the backend, Prisma ORM for database operations, and React/Next.js for the frontend.

## Architecture

### High-Level Architecture

```
┌─────────────────────┐
│  Shopify Stores (N) │
└──────────┬──────────┘
           │
           │ OAuth / Webhooks / API Calls
           │
           ▼
┌─────────────────────────────────────────┐
│         Backend Services                 │
│  ┌────────────────────────────────────┐ │
│  │   Shopify Integration Module       │ │
│  │   - OAuth Handler                  │ │
│  │   - API Client Factory             │ │
│  │   - Rate Limit Manager             │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │   Ingestion Services               │ │
│  │   - Customer Ingestion             │ │
│  │   - Order Ingestion                │ │
│  │   - Product Ingestion              │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │   Webhook Handler                  │ │
│  │   - Signature Verification         │ │
│  │   - Event Processing               │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │   Sync Service (Cron)              │ │
│  │   - Scheduled Data Sync            │ │
│  │   - Tenant Iteration               │ │
│  └────────────────────────────────────┘ │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│      PostgreSQL Database                 │
│      (Multi-Tenant Schema)               │
│  - Tenants                               │
│  - Customers                             │
│  - Orders                                │
│  - Products                              │
│  - Users                                 │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│      Analytics Module                    │
│  - Metrics Calculation                   │
│  - Aggregation Queries                   │
│  - Date Range Filtering                  │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│      API Layer (Express Routes)          │
│  - /api/auth/*                           │
│  - /api/tenants/*                        │
│  - /api/analytics/*                      │
│  - /webhooks/*                           │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│      Frontend (Next.js/React)            │
│  - Login Page                            │
│  - Dashboard                             │
│  - Charts & Visualizations               │
└─────────────────────────────────────────┘
```

### Technology Stack

**Backend:**
- Runtime: Node.js (v18+)
- Framework: Express.js
- ORM: Prisma
- Database: PostgreSQL
- Shopify Integration: @shopify/shopify-api
- Scheduling: node-cron
- Encryption: crypto (built-in)
- Password Hashing: bcrypt

**Frontend:**
- Framework: Next.js 14
- UI Library: React 18
- Charting: Chart.js or Recharts
- HTTP Client: Axios or fetch
- State Management: React Context API or Zustand

**DevOps:**
- Environment Management: dotenv
- Process Management: PM2 (production)
- Logging: Winston or Pino

## Components and Interfaces

### 1. Configuration Module

**Purpose:** Centralize all configuration and environment variables.

**Files:**
- `src/config/env.ts` - Environment variable validation and export
- `src/config/database.ts` - Database connection configuration
- `src/config/shopify.ts` - Shopify API client configuration

**Interface:**
```typescript
// src/config/env.ts
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

export const CONFIG: Config;
```

### 2. Tenant Management Module

**Purpose:** Handle tenant registration, retrieval, and management.

**Files:**
- `src/modules/tenant/tenant.service.ts`
- `src/modules/tenant/tenant.types.ts`

**Interface:**
```typescript
export interface Tenant {
  id: string;
  shopName: string;
  accessToken: string; // encrypted
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantService {
  registerTenant(shopName: string, accessToken: string): Promise<Tenant>;
  getTenantById(id: string): Promise<Tenant | null>;
  getTenantByShopName(shopName: string): Promise<Tenant | null>;
  getAllTenants(): Promise<Tenant[]>;
  updateAccessToken(id: string, accessToken: string): Promise<Tenant>;
  deleteTenant(id: string): Promise<void>;
}
```

### 3. Shopify Integration Module

**Purpose:** Manage Shopify API interactions, OAuth flow, and rate limiting.

**Files:**
- `src/modules/shopify/client.ts` - Shopify REST client factory
- `src/modules/shopify/auth.service.ts` - OAuth flow handling
- `src/modules/shopify/rate-limiter.ts` - Rate limit management

**Interface:**
```typescript
export interface ShopifyClient {
  get(path: string, params?: Record<string, any>): Promise<any>;
  post(path: string, data: any): Promise<any>;
  put(path: string, data: any): Promise<any>;
  delete(path: string): Promise<any>;
}

export interface AuthService {
  generateAuthUrl(shop: string, redirectUri: string): string;
  exchangeCodeForToken(shop: string, code: string): Promise<string>;
  validateShop(shop: string): boolean;
}

export function getShopifyClient(tenant: Tenant): ShopifyClient;
```

### 4. Data Ingestion Module

**Purpose:** Fetch and store data from Shopify APIs into the database.

**Files:**
- `src/modules/ingestion/customers.ingest.ts`
- `src/modules/ingestion/orders.ingest.ts`
- `src/modules/ingestion/products.ingest.ts`
- `src/modules/ingestion/types.ts`

**Interface:**
```typescript
export interface IngestionResult {
  success: boolean;
  recordsProcessed: number;
  errors: string[];
  duration: number;
}

export interface CustomerIngestion {
  ingestCustomers(tenant: Tenant, client: ShopifyClient): Promise<IngestionResult>;
}

export interface OrderIngestion {
  ingestOrders(tenant: Tenant, client: ShopifyClient): Promise<IngestionResult>;
}

export interface ProductIngestion {
  ingestProducts(tenant: Tenant, client: ShopifyClient): Promise<IngestionResult>;
}
```

### 5. Sync Service Module

**Purpose:** Periodically sync data from all tenants using cron scheduling.

**Files:**
- `src/modules/shopify/sync.service.ts`

**Interface:**
```typescript
export interface SyncService {
  syncTenantData(tenant: Tenant): Promise<void>;
  syncAllTenants(): Promise<void>;
  startScheduledSync(intervalMinutes: number): void;
  stopScheduledSync(): void;
}
```

### 6. Webhook Handler Module

**Purpose:** Receive and process real-time events from Shopify.

**Files:**
- `src/modules/shopify/webhook.handler.ts`
- `src/modules/shopify/webhook.types.ts`

**Interface:**
```typescript
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
```

### 7. Analytics Module

**Purpose:** Calculate metrics and generate insights from stored data.

**Files:**
- `src/modules/analytics/metrics.service.ts`
- `src/modules/analytics/types.ts`

**Interface:**
```typescript
export interface DashboardMetrics {
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  topCustomers: TopCustomer[];
}

export interface TopCustomer {
  customerId: string;
  customerName: string;
  customerEmail: string;
  totalRevenue: number;
  orderCount: number;
}

export interface OrdersByDate {
  date: string;
  orderCount: number;
  revenue: number;
}

export interface MetricsService {
  getDashboardMetrics(tenantId: string): Promise<DashboardMetrics>;
  getTopCustomers(tenantId: string, limit: number): Promise<TopCustomer[]>;
  getOrdersByDateRange(tenantId: string, startDate: Date, endDate: Date): Promise<OrdersByDate[]>;
}
```

### 8. Authentication Module

**Purpose:** Handle user authentication and session management.

**Files:**
- `src/modules/auth/session.ts`
- `src/modules/auth/userAuth.ts`
- `src/modules/auth/types.ts`

**Interface:**
```typescript
export interface User {
  id: string;
  username: string;
  passwordHash: string;
  tenantId: string;
  createdAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  tenantId: string;
  token: string;
  expiresAt: Date;
}

export interface AuthService {
  login(username: string, password: string): Promise<Session>;
  logout(sessionToken: string): Promise<void>;
  validateSession(sessionToken: string): Promise<Session | null>;
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
}
```

### 9. API Routes

**Purpose:** Expose HTTP endpoints for frontend consumption.

**Files:**
- `src/routes/auth.routes.ts`
- `src/routes/tenant.routes.ts`
- `src/routes/analytics.routes.ts`
- `src/routes/shopify.routes.ts`

**Endpoints:**
```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/session

GET    /api/shopify/auth?shop=<shop_name>
GET    /api/shopify/callback?code=<code>&shop=<shop>

GET    /api/analytics/summary
GET    /api/analytics/top-customers?limit=5
GET    /api/analytics/orders?from=<date>&to=<date>

POST   /webhooks/orders/create
POST   /webhooks/orders/update
POST   /webhooks/customers/create
```

## Data Models

### Database Schema (Prisma)

```prisma
model Tenant {
  id           String    @id @default(cuid())
  shopName     String    @unique
  accessToken  String    // encrypted
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  
  customers    Customer[]
  orders       Order[]
  products     Product[]
  users        User[]
  
  @@index([shopName])
}

model Customer {
  id        String   @id
  tenantId  String
  email     String
  firstName String?
  lastName  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  orders    Order[]
  
  @@index([tenantId])
  @@index([email])
}

model Order {
  id          String   @id
  tenantId    String
  customerId  String?
  totalPrice  Float
  currency    String   @default("USD")
  orderNumber String?
  createdAt   DateTime
  updatedAt   DateTime @updatedAt
  
  tenant      Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  customer    Customer? @relation(fields: [customerId], references: [id], onDelete: SetNull)
  
  @@index([tenantId])
  @@index([customerId])
  @@index([createdAt])
}

model Product {
  id        String   @id
  tenantId  String
  title     String
  price     Float?
  vendor    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  @@index([tenantId])
}

model User {
  id           String   @id @default(cuid())
  username     String   @unique
  passwordHash String
  tenantId     String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  tenant       Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  sessions     Session[]
  
  @@index([username])
  @@index([tenantId])
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([token])
  @@index([userId])
}
```

### Data Flow

1. **OAuth Flow:**
   - User clicks "Connect Shopify Store"
   - System redirects to Shopify OAuth
   - Shopify redirects back with authorization code
   - System exchanges code for access token
   - System creates Tenant record with encrypted token
   - System triggers initial data ingestion

2. **Data Ingestion Flow:**
   - Sync Service retrieves all Tenants
   - For each Tenant, creates Shopify client
   - Fetches customers, orders, products via REST API
   - Upserts records into database with tenant isolation
   - Logs results and errors

3. **Webhook Flow:**
   - Shopify sends POST request to webhook endpoint
   - System verifies HMAC signature
   - System identifies Tenant by shop domain header
   - System processes event (e.g., order created)
   - System updates database

4. **Analytics Flow:**
   - Frontend requests metrics via API
   - System validates session token
   - System extracts tenantId from session
   - System queries database with tenant filter
   - System aggregates and returns results

## 
Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: OAuth redirect URL validity
*For any* valid Shopify store domain, when initiating the OAuth connection process, the redirect URL should contain the Shopify OAuth authorization endpoint with correct parameters.
**Validates: Requirements 1.1**

### Property 2: Access token encryption round-trip
*For any* access token and shop name, storing the tenant record and then retrieving it should return the same decrypted access token value.
**Validates: Requirements 1.3, 15.1, 15.2**

### Property 3: Tenant registration triggers ingestion
*For any* successfully registered tenant, the system should initiate data ingestion for customers, orders, and products.
**Validates: Requirements 1.5**

### Property 4: Customer ingestion idempotence
*For any* customer record, ingesting it multiple times should result in a single database record with the most recent data, not duplicates.
**Validates: Requirements 2.3**

### Property 5: Customer data completeness
*For any* customer retrieved from Shopify, the stored record should contain all required fields: unique identifier, email, name, and tenant identifier.
**Validates: Requirements 2.2**

### Property 6: Order ingestion idempotence
*For any* order record, ingesting it multiple times should not create duplicate orders in the database.
**Validates: Requirements 3.3**

### Property 7: Order data completeness
*For any* order retrieved from Shopify, the stored record should contain all required fields: unique identifier, tenant identifier, customer identifier (or null), total price, and creation timestamp.
**Validates: Requirements 3.2**

### Property 8: Order-customer referential integrity
*For any* order in the database with a non-null customer identifier, that customer must exist in the database for the same tenant.
**Validates: Requirements 3.4**

### Property 9: Product ingestion idempotence
*For any* product record, ingesting it multiple times should result in updates to the existing record, not duplicates.
**Validates: Requirements 4.3**

### Property 10: Product data completeness
*For any* product retrieved from Shopify, the stored record should contain all required fields: unique identifier, tenant identifier, title, and price (or null if unavailable).
**Validates: Requirements 4.2**

### Property 11: Sync service tenant completeness
*For any* set of registered tenants, when the sync service executes, it should process all tenants without skipping any.
**Validates: Requirements 5.1**

### Property 12: Sync service ingestion order
*For any* tenant being synced, the system should ingest customers before orders, and orders before products, to maintain referential integrity.
**Validates: Requirements 5.2**

### Property 13: Webhook signature verification
*For any* webhook payload and signature, the system should correctly validate authentic Shopify webhooks and reject invalid ones.
**Validates: Requirements 6.1**

### Property 14: Webhook tenant identification
*For any* valid webhook with a shop domain header, the system should correctly identify and retrieve the corresponding tenant.
**Validates: Requirements 6.2**

### Property 15: Webhook success response
*For any* successfully processed webhook, the system should respond with HTTP status 200.
**Validates: Requirements 6.4**

### Property 16: Customer count accuracy
*For any* tenant, the calculated total customer count should equal the number of customer records in the database for that tenant.
**Validates: Requirements 7.1**

### Property 17: Order count accuracy
*For any* tenant, the calculated total order count should equal the number of order records in the database for that tenant.
**Validates: Requirements 7.2**

### Property 18: Revenue calculation accuracy
*For any* tenant, the calculated total revenue should equal the sum of all order total prices for that tenant.
**Validates: Requirements 7.3**

### Property 19: Metrics response format
*For any* metrics request, the API response should be valid JSON containing the expected fields: totalCustomers, totalOrders, totalRevenue, and topCustomers.
**Validates: Requirements 7.4**

### Property 20: Top customers aggregation accuracy
*For any* tenant, the revenue total for each customer in the top customers list should equal the sum of that customer's order totals.
**Validates: Requirements 8.2**

### Property 21: Top customers sort order
*For any* top customers list, customers should be sorted in descending order by total revenue, with the highest revenue customer first.
**Validates: Requirements 8.3**

### Property 22: Top customers result limit
*For any* top customers request, the system should return at most five customers with their identifiers and revenue totals.
**Validates: Requirements 8.4**

### Property 23: Date range filtering - start date
*For any* start date parameter, the returned orders should all have creation timestamps on or after that date.
**Validates: Requirements 9.1**

### Property 24: Date range filtering - end date
*For any* end date parameter, the returned orders should all have creation timestamps on or before that date.
**Validates: Requirements 9.2**

### Property 25: Date range filtering - inclusive range
*For any* start and end date parameters, all returned orders should have creation timestamps within the inclusive range.
**Validates: Requirements 9.3**

### Property 26: Query tenant isolation
*For any* authenticated user request, all returned data should belong only to that user's tenant, with no data leakage from other tenants.
**Validates: Requirements 9.4, 11.4**

### Property 27: Session creation on valid login
*For any* valid username and password combination, the system should create a session with a unique secure token.
**Validates: Requirements 10.2**

### Property 28: Session-tenant association
*For any* created session, it should be associated with the correct tenant identifier from the authenticated user.
**Validates: Requirements 10.3**

### Property 29: Session validation enforces tenant isolation
*For any* request with a valid session token, the system should only return data for the tenant associated with that session.
**Validates: Requirements 10.4**

### Property 30: Customer tenant foreign key requirement
*For any* customer record, it must have a valid tenant identifier that references an existing tenant.
**Validates: Requirements 11.1**

### Property 31: Order tenant foreign key requirement
*For any* order record, it must have a valid tenant identifier that references an existing tenant.
**Validates: Requirements 11.2**

### Property 32: Product tenant foreign key requirement
*For any* product record, it must have a valid tenant identifier that references an existing tenant.
**Validates: Requirements 11.3**

### Property 33: Tenant deletion cascades
*For any* tenant, deleting it should either cascade delete all associated customers, orders, and products, or prevent deletion if dependencies exist.
**Validates: Requirements 11.5**

### Property 34: Rate limit logging
*For any* rate limit error from the Shopify API, the system should log the event with the tenant identifier and timestamp.
**Validates: Requirements 13.3**

### Property 35: Password hashing strength
*For any* user password, the system should hash it using bcrypt with a cost factor of at least 10.
**Validates: Requirements 15.3**

### Property 36: Sensitive data not in logs
*For any* log entry, it should not contain plain text access tokens, encryption keys, or passwords.
**Validates: Requirements 15.5**

## Error Handling

### Error Categories

1. **External API Errors:**
   - Shopify API rate limiting (429)
   - Shopify API authentication errors (401, 403)
   - Shopify API server errors (500, 502, 503)
   - Network timeouts and connection failures

2. **Database Errors:**
   - Connection failures
   - Constraint violations
   - Query timeouts
   - Transaction deadlocks

3. **Validation Errors:**
   - Invalid shop domain format
   - Invalid date formats
   - Missing required parameters
   - Invalid session tokens

4. **Business Logic Errors:**
   - Tenant not found
   - User not found
   - Duplicate tenant registration
   - Webhook signature mismatch

### Error Handling Strategies

**Retry with Exponential Backoff:**
- Applied to: Shopify API calls, database connection failures
- Max retries: 5
- Initial delay: 1 second
- Backoff multiplier: 2
- Max delay: 32 seconds

**Circuit Breaker Pattern:**
- Applied to: Shopify API calls per tenant
- Failure threshold: 5 consecutive failures
- Timeout: 60 seconds
- Half-open state: Allow 1 test request after timeout

**Graceful Degradation:**
- If sync fails for one tenant, continue with remaining tenants
- If one ingestion type fails (e.g., customers), continue with others (orders, products)
- If analytics calculation fails, return partial results with error indicator

**Error Logging:**
- All errors logged with:
  - Timestamp
  - Error type and message
  - Stack trace (for unexpected errors)
  - Context (tenant ID, user ID, request ID)
  - Severity level (ERROR, WARN, INFO)

**User-Facing Errors:**
- Generic error messages for security (don't expose internal details)
- Specific error codes for frontend to handle appropriately
- Retry suggestions where applicable
- Support contact information for critical errors

### Error Response Format

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
    retryable: boolean;
  };
  requestId: string;
  timestamp: string;
}
```

**Example Error Codes:**
- `AUTH_INVALID_CREDENTIALS` - Invalid username or password
- `AUTH_SESSION_EXPIRED` - Session token expired
- `TENANT_NOT_FOUND` - Tenant does not exist
- `SHOPIFY_RATE_LIMIT` - Shopify API rate limit exceeded
- `SHOPIFY_AUTH_FAILED` - Shopify OAuth failed
- `VALIDATION_INVALID_DATE` - Invalid date format
- `DATABASE_CONNECTION_FAILED` - Database connection error
- `INTERNAL_SERVER_ERROR` - Unexpected server error

## Testing Strategy

### Unit Testing

**Framework:** Jest
**Coverage Target:** 80% code coverage

**Unit Test Focus:**
- Individual service functions (tenant service, ingestion services, analytics service)
- Utility functions (encryption, date parsing, validation)
- Data transformations
- Error handling logic
- Authentication and session management

**Example Unit Tests:**
- Test that `encryptToken()` produces different output for same input (due to IV)
- Test that `decryptToken(encryptToken(token))` returns original token
- Test that `hashPassword()` produces bcrypt hashes with correct cost factor
- Test that `validateShopDomain()` accepts valid domains and rejects invalid ones
- Test that `calculateRevenue()` correctly sums order totals
- Test that `filterOrdersByDateRange()` returns only orders within range

### Property-Based Testing

**Framework:** fast-check (JavaScript property-based testing library)
**Configuration:** Minimum 100 iterations per property test

**Property Test Requirements:**
- Each correctness property from the design document must be implemented as a property-based test
- Each test must be tagged with a comment referencing the design document property
- Tag format: `// Feature: shopify-multi-tenant-dashboard, Property X: <property_text>`
- Tests should generate random valid inputs to verify properties hold across all cases

**Example Property Tests:**
- Property 2: Generate random tokens and shop names, verify encryption round-trip
- Property 4: Generate random customer data, ingest twice, verify single record exists
- Property 18: Generate random orders, verify revenue sum equals individual order totals
- Property 26: Generate random tenants and data, verify queries never return cross-tenant data

### Integration Testing

**Framework:** Jest with Supertest for API testing
**Database:** Test database with isolated schema per test

**Integration Test Focus:**
- API endpoint behavior (request/response)
- Database operations (CRUD)
- OAuth flow end-to-end
- Webhook processing end-to-end
- Session management and authentication flow

**Example Integration Tests:**
- Test complete OAuth flow from initiation to token storage
- Test webhook receipt, verification, and data ingestion
- Test login flow creates session and subsequent requests use it
- Test analytics API returns correct metrics for tenant
- Test date range filtering via API endpoint

### End-to-End Testing

**Framework:** Playwright or Cypress
**Environment:** Staging environment with test Shopify store

**E2E Test Focus:**
- User workflows through the UI
- Complete data flow from Shopify to dashboard
- Error scenarios and user feedback

**Example E2E Tests:**
- User connects Shopify store and sees initial data sync
- User logs in and views dashboard with metrics
- User filters orders by date range and sees updated chart
- User sees error message when API fails and can retry

### Test Data Management

**Approach:**
- Use factories/builders for generating test data
- Use database transactions for test isolation (rollback after each test)
- Mock external Shopify API calls in unit and integration tests
- Use test Shopify store for E2E tests

**Test Data Generators:**
```typescript
// Example test data generators
function generateTenant(): Tenant;
function generateCustomer(tenantId: string): Customer;
function generateOrder(tenantId: string, customerId?: string): Order;
function generateProduct(tenantId: string): Product;
function generateUser(tenantId: string): User;
```

### Continuous Integration

**CI Pipeline:**
1. Lint code (ESLint)
2. Type check (TypeScript)
3. Run unit tests
4. Run property-based tests
5. Run integration tests
6. Generate coverage report
7. Build application
8. Run E2E tests (on staging)

**Quality Gates:**
- All tests must pass
- Code coverage >= 80%
- No TypeScript errors
- No high-severity linting errors

## Security Considerations

### Authentication & Authorization

- Passwords hashed with bcrypt (cost factor 10+)
- Session tokens generated with cryptographically secure random bytes
- Session tokens stored hashed in database
- Session expiration enforced (24 hours default)
- Tenant isolation enforced at database query level
- All API endpoints require valid session except OAuth callbacks

### Data Protection

- Shopify access tokens encrypted at rest using AES-256
- Encryption keys stored in environment variables, never in code
- Database connections use SSL/TLS in production
- Sensitive data never logged in plain text
- Input validation on all user inputs
- SQL injection prevention via Prisma ORM parameterized queries

### API Security

- Webhook signature verification using HMAC-SHA256
- Rate limiting on API endpoints (100 requests/minute per user)
- CORS configured to allow only frontend domain
- CSRF protection on state-changing endpoints
- Request size limits to prevent DoS
- Helmet.js for security headers

### Shopify Integration Security

- OAuth state parameter to prevent CSRF
- Validate shop domain format before OAuth redirect
- Verify OAuth callback originates from Shopify
- Store minimal required scopes for Shopify access
- Regularly rotate webhook secrets
- Monitor for suspicious API usage patterns

## Performance Considerations

### Database Optimization

- Indexes on frequently queried columns (tenantId, email, createdAt)
- Composite indexes for common query patterns
- Connection pooling (max 20 connections)
- Query result caching for dashboard metrics (5-minute TTL)
- Pagination for large result sets (100 records per page)
- Database query timeout (30 seconds)

### API Performance

- Response compression (gzip)
- HTTP/2 support
- CDN for static frontend assets
- API response caching where appropriate
- Lazy loading of dashboard components
- Debouncing of user input for search/filter

### Scalability

- Horizontal scaling of API servers (stateless design)
- Database read replicas for analytics queries
- Message queue for async ingestion jobs (future enhancement)
- Separate worker processes for sync service
- Monitoring and alerting for performance degradation

### Monitoring

- Application performance monitoring (APM)
- Database query performance tracking
- API endpoint response time metrics
- Error rate monitoring
- Shopify API usage tracking
- Resource utilization (CPU, memory, disk)

## Deployment Architecture

### Production Environment

**Infrastructure:**
- Cloud provider: AWS, Google Cloud, or Azure
- Application servers: 2+ instances behind load balancer
- Database: PostgreSQL managed service with automated backups
- Caching: Redis for session storage and caching
- Monitoring: CloudWatch, Datadog, or New Relic
- Logging: Centralized logging (ELK stack or cloud equivalent)

**Environment Variables:**
```
DATABASE_URL=postgresql://...
SHOPIFY_API_KEY=...
SHOPIFY_API_SECRET=...
SHOPIFY_API_VERSION=2024-01
SESSION_SECRET=...
WEBHOOK_SECRET=...
ENCRYPTION_KEY=...
NODE_ENV=production
PORT=3000
REDIS_URL=...
```

**Deployment Process:**
1. Run tests in CI/CD pipeline
2. Build Docker image
3. Push to container registry
4. Deploy to staging environment
5. Run smoke tests
6. Deploy to production with rolling update
7. Monitor for errors
8. Rollback if issues detected

### Development Environment

**Local Setup:**
- Docker Compose for PostgreSQL and Redis
- Node.js 18+ installed locally
- Environment variables in `.env` file
- Hot reload for development
- Test Shopify store for OAuth testing

**Development Workflow:**
1. Create feature branch
2. Implement changes with tests
3. Run tests locally
4. Commit and push
5. Create pull request
6. CI runs tests
7. Code review
8. Merge to main
9. Auto-deploy to staging

## Future Enhancements

### Phase 2 Features

- Support for additional Shopify data types (inventory, collections, discounts)
- Advanced analytics (cohort analysis, customer lifetime value)
- Custom report builder
- Email notifications for key events
- Multi-user support per tenant with role-based access control
- API rate limit dashboard and alerts
- Bulk data export functionality

### Phase 3 Features

- Real-time dashboard updates via WebSockets
- Machine learning insights (sales forecasting, churn prediction)
- Integration with other e-commerce platforms (WooCommerce, BigCommerce)
- Mobile app for iOS and Android
- Advanced data visualization options
- Scheduled report generation and delivery
- Audit log for all data changes

### Technical Debt & Improvements

- Migrate to GraphQL for more flexible API queries
- Implement event sourcing for audit trail
- Add full-text search for products and customers
- Implement data archival strategy for old records
- Add support for multiple currencies
- Implement automated data quality checks
- Add support for Shopify Plus features
