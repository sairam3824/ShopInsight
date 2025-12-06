# Implementation Plan

- [x] 1. Initialize project structure and dependencies
  - Create Node.js project with TypeScript configuration
  - Install core dependencies (Express, Prisma, @shopify/shopify-api, bcrypt, node-cron)
  - Set up ESLint and Prettier for code quality
  - Create folder structure following modular architecture
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 2. Set up database and Prisma ORM
  - Initialize Prisma with PostgreSQL
  - Create Prisma schema with all models (Tenant, Customer, Order, Product, User, Session)
  - Add indexes for performance optimization
  - Run initial migration
  - _Requirements: 11.1, 11.2, 11.3, 11.5_

- [x] 3. Implement configuration module
  - Create env.ts with environment variable validation
  - Create database.ts for Prisma client initialization
  - Create shopify.ts for Shopify API configuration
  - Add encryption key management
  - _Requirements: 15.4_

- [x] 4. Implement encryption utilities
  - Create encryption service with AES-256 for access tokens
  - Implement encrypt and decrypt functions
  - Add password hashing with bcrypt (cost factor 10+)
  - _Requirements: 15.1, 15.2, 15.3_



- [x] 5. Implement Tenant Management module
  - Create tenant.service.ts with CRUD operations
  - Implement registerTenant with encrypted token storage
  - Implement getTenantById, getTenantByShopName, getAllTenants
  - Add tenant deletion with cascade handling
  - _Requirements: 1.3, 11.5_



- [x] 6. Implement Shopify OAuth authentication
  - Create auth.service.ts for OAuth flow
  - Implement generateAuthUrl for OAuth initiation
  - Implement exchangeCodeForToken for token exchange
  - Add shop domain validation
  - _Requirements: 1.1, 1.2_



- [x] 7. Implement Shopify API client factory
  - Create client.ts with getShopifyClient function
  - Add rate limit handling with exponential backoff
  - Implement retry logic (max 5 attempts)
  - Add circuit breaker pattern for API failures
  - _Requirements: 13.1, 13.2, 13.4_



- [x] 8. Implement Customer Ingestion service
  - Create customers.ingest.ts
  - Implement ingestCustomers to fetch from Shopify API
  - Add upsert logic for idempotent ingestion
  - Ensure all required fields are stored (id, tenantId, email, name)
  - Add logging for processed count and errors
  - _Requirements: 2.1, 2.2, 2.3, 2.4_



- [x] 9. Implement Order Ingestion service
  - Create orders.ingest.ts
  - Implement ingestOrders to fetch from Shopify API
  - Add duplicate prevention logic
  - Handle orders with null customer references
  - Ensure referential integrity with customers
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_



- [x] 10. Implement Product Ingestion service
  - Create products.ingest.ts
  - Implement ingestProducts to fetch from Shopify API
  - Add upsert logic for product updates
  - Handle products with null prices
  - Add logging for processed count
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_



- [x] 11. Implement Sync Service with cron scheduling
  - Create sync.service.ts
  - Implement syncTenantData to orchestrate ingestion
  - Implement syncAllTenants to iterate through all tenants
  - Add cron job for 10-minute intervals
  - Ensure sync continues on individual tenant failures
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_



- [x] 12. Implement Webhook Handler
  - Create webhook.handler.ts
  - Implement HMAC signature verification
  - Implement handleOrderCreate for order webhooks
  - Add tenant identification from shop domain header
  - Return HTTP 200 on success, 401 on invalid signature
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_



- [x] 13. Implement Analytics Metrics service
  - Create metrics.service.ts
  - Implement getDashboardMetrics (customer count, order count, revenue)
  - Ensure all queries filter by tenantId
  - Return results in JSON format
  - _Requirements: 7.1, 7.2, 7.3, 7.4_



- [x] 14. Implement Top Customers analytics
  - Add getTopCustomers to metrics.service.ts
  - Group orders by customer and sum revenue
  - Sort customers by revenue descending
  - Return top 5 customers with details
  - Exclude customers with no orders
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_



- [x] 15. Implement date range filtering for orders
  - Add getOrdersByDateRange to metrics.service.ts
  - Implement start date filtering (on or after)
  - Implement end date filtering (on or before)
  - Support inclusive date range queries
  - Ensure tenant isolation in all queries
  - Handle invalid date formats with 400 error
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_



- [x] 16. Implement User Authentication module
  - Create userAuth.ts with login/logout functions
  - Implement password verification with bcrypt
  - Add user creation with password hashing
  - _Requirements: 10.1, 10.5_

- [x] 17. Implement Session Management
  - Create session.ts for session operations
  - Implement session creation with secure random tokens
  - Add session-tenant association
  - Implement session validation
  - Add session expiration (24 hours)
  - _Requirements: 10.2, 10.3, 10.4_



- [x] 18. Implement authentication middleware
  - Create middleware to validate session tokens
  - Extract tenantId from session
  - Attach user and tenant info to request object
  - Return 401 for invalid/expired sessions
  - _Requirements: 10.4_

- [x] 19. Implement API routes for authentication
  - Create auth.routes.ts
  - Add POST /api/auth/login endpoint
  - Add POST /api/auth/logout endpoint
  - Add GET /api/auth/session endpoint for validation
  - _Requirements: 10.1, 10.2_

- [x] 20. Implement API routes for Shopify OAuth
  - Create shopify.routes.ts
  - Add GET /api/shopify/auth endpoint for OAuth initiation
  - Add GET /api/shopify/callback endpoint for OAuth callback
  - Trigger initial ingestion after successful OAuth
  - _Requirements: 1.1, 1.2, 1.3, 1.5_



- [x] 21. Implement API routes for analytics
  - Create analytics.routes.ts
  - Add GET /api/analytics/summary endpoint
  - Add GET /api/analytics/top-customers endpoint
  - Add GET /api/analytics/orders endpoint with date filtering
  - Apply authentication middleware to all routes
  - _Requirements: 7.4, 8.4, 9.1, 9.2, 9.3_

- [x] 22. Implement webhook routes
  - Add POST /webhooks/orders/create endpoint
  - Add POST /webhooks/orders/update endpoint
  - Add POST /webhooks/customers/create endpoint
  - Apply webhook signature verification
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 23. Implement error handling middleware
  - Create global error handler
  - Format error responses consistently
  - Log errors with context
  - Return appropriate HTTP status codes
  - Ensure sensitive data not exposed in errors
  - _Requirements: 15.5_



- [x] 24. Implement logging service
  - Set up Winston or Pino for structured logging
  - Add log levels (ERROR, WARN, INFO, DEBUG)
  - Ensure no plain text secrets in logs
  - Add request ID tracking
  - _Requirements: 2.4, 4.4, 5.3, 13.3, 15.5_

- [x] 25. Add input validation
  - Create validation schemas for all API inputs
  - Validate shop domain format
  - Validate date formats
  - Validate required parameters
  - Return 400 errors for invalid input
  - _Requirements: 9.5_

- [x] 26. Implement rate limiting
  - Add rate limiting middleware (100 req/min per user)
  - Apply to all API endpoints
  - Return 429 when limit exceeded
  - _Requirements: 13.1_

- [x] 27. Add security headers and CORS
  - Install and configure Helmet.js
  - Configure CORS for frontend domain
  - Add CSRF protection
  - Set request size limits
  - _Requirements: Security considerations_



- [x] 29. Initialize Next.js frontend project
  - Create Next.js 14 app with TypeScript
  - Set up folder structure (pages, components, lib, styles)
  - Install UI dependencies (Chart.js or Recharts)
  - Configure API client (Axios or fetch)
  - _Requirements: 14.1, 14.2, 14.3_

- [x] 30. Implement login page
  - Create login form component
  - Add username and password inputs
  - Handle form submission
  - Store session token in localStorage/cookies
  - Redirect to dashboard on success
  - Display error messages on failure
  - _Requirements: 10.1_

- [x] 31. Implement authentication context
  - Create React Context for auth state
  - Provide session token and user info
  - Add login/logout functions
  - Implement protected route wrapper
  - _Requirements: 10.2, 10.4_

- [x] 32. Implement dashboard layout
  - Create dashboard page component
  - Add navigation header
  - Add logout button
  - Create responsive grid layout
  - _Requirements: 14.1_

- [x] 33. Implement dashboard metrics summary
  - Create MetricsSummary component
  - Fetch data from /api/analytics/summary
  - Display total customers, orders, revenue
  - Add loading indicators
  - Handle API errors with retry option
  - _Requirements: 14.1, 14.4, 14.5_

- [x] 34. Implement top customers list
  - Create TopCustomers component
  - Fetch data from /api/analytics/top-customers
  - Display customer names, emails, and revenue
  - Format currency values
  - _Requirements: 14.3_

- [x] 35. Implement orders chart
  - Create OrdersChart component
  - Fetch data from /api/analytics/orders
  - Implement date range picker
  - Display chart using Chart.js or Recharts
  - Update chart when date range changes
  - _Requirements: 14.2_

- [x] 36. Add error boundaries
  - Create ErrorBoundary component
  - Catch and display React errors
  - Provide fallback UI
  - Log errors for debugging
  - _Requirements: 14.5_

- [x] 37. Implement loading states
  - Create Loading component
  - Add skeleton loaders for data
  - Show spinners during API calls
  - _Requirements: 14.4_

- [x] 38. Add responsive design
  - Ensure mobile-friendly layouts
  - Test on different screen sizes
  - Add media queries for breakpoints
  - _Requirements: 14.1_

- [x] 39. Implement environment configuration
  - Create .env.example file
  - Document all required environment variables
  - Add validation for required vars on startup
  - _Requirements: 15.4_

- [x] 40. Create Docker configuration
  - Create Dockerfile for backend
  - Create Dockerfile for frontend
  - Create docker-compose.yml for local development
  - Include PostgreSQL and Redis services
  - _Requirements: Deployment_

- [x] 41. Write README documentation
  - Add project overview
  - Document setup instructions
  - List all environment variables
  - Add API endpoint documentation
  - Include development workflow
  - _Requirements: 4.1 (Documentation requirement)_

- [x] 42. Set up CI/CD pipeline
  - Configure GitHub Actions or similar
  - Add linting step
  - Add type checking step
  - Add test execution step
  - Add build step
  - _Requirements: Testing Strategy_



- [x] 43. Deploy to staging environment
  - Set up staging infrastructure
  - Deploy backend and frontend
  - Configure environment variables
  - Run smoke tests
  - _Requirements: Deployment Architecture_

- [x] 44. Perform manual testing
  - Test complete user workflows
  - Test error scenarios
  - Verify data accuracy
  - Check performance
  - _Requirements: Testing Strategy_

- [x] 45. Production deployment preparation
  - Review security checklist
  - Set up monitoring and alerting
  - Configure backups
  - Prepare rollback plan
  - Document deployment process
  - _Requirements: Deployment Architecture_
