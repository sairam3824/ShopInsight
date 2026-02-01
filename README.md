# Shopify Multi-Tenant Dashboard

A production-ready multi-tenant analytics platform that enables Shopify store owners to connect their stores, automatically sync data, and gain actionable insights through a modern web dashboard.

## Overview

This system provides a centralized analytics solution for multiple Shopify stores with:

- **Multi-Tenant Architecture** - Complete data isolation between stores
- **Secure OAuth Integration** - Connect Shopify stores safely using OAuth 2.0
- **Automated Data Sync** - Real-time webhooks and periodic polling keep data fresh
- **Rich Analytics Dashboard** - Professional UI with side-navigation, top-selling products, and revenue insights
- **Data Portability** - Export order history directly to CSV for external reporting

## Features

### Core Capabilities

- **Shopify Store Connection** - OAuth-based authentication with encrypted token storage
- **Data Ingestion** - Automatic sync of customers, orders, and products
- **Real-Time Updates** - Webhook handlers for instant order notifications
- **Interactive Dashboard** - Modern side-navigation layout featuring:
  - **Metrics Summary** - Total customers, orders, revenue, and AOV
  - **Orders Graph** - Interactive time-series data visualization
  - **Top Customers** - Ranked insights into your most valuable buyers
  - **Top Products** - Performance tracking for your best-selling items
- **Store Connect Flow** - Dedicated page for seamless Shopify integration via OAuth
- **Secure Authentication** - Protected routes with JWT-based sessions and bcrypt hashing
- **Data Export** - One-click CSV export for offline analysis

### Technical Highlights

- Modular architecture with clear separation of concerns
- Rate limit handling with exponential backoff
- Comprehensive error handling and logging
- AES-256 encryption for sensitive data
- PostgreSQL with Prisma ORM
- RESTful API design
- Docker support for easy deployment

## Architecture

```
┌─────────────────┐
│ Shopify Stores  │
└────────┬────────┘
         │ OAuth/Webhooks/API
         ▼
┌─────────────────────────────┐
│   Backend Services          │
│   - Shopify Integration     │
│   - Data Ingestion          │
│   - Webhook Handler         │
│   - Analytics Engine        │
│   - Sync Service (Cron)     │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│   PostgreSQL Database       │
│   (Multi-Tenant Schema)     │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│   API Layer (Express)       │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│   Frontend (Next.js/React)  │
└─────────────────────────────┘
```

## Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Shopify SDK:** @shopify/shopify-api
- **Scheduling:** node-cron
- **Security:** bcrypt, crypto, helmet
- **Logging:** Winston

### Frontend
- **Framework:** Next.js 14
- **UI Library:** React 18
- **Styling:** CSS Modules
- **HTTP Client:** Fetch API
- **State Management:** React Context API

### DevOps
- **Environment:** dotenv
- **Process Management:** PM2 (production)

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- npm or yarn
- Shopify Partner account (for API credentials)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shopify-multi-tenant-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/shopify_dashboard"

   # Shopify API
   SHOPIFY_API_KEY="your_api_key"
   SHOPIFY_API_SECRET="your_api_secret"
   SHOPIFY_API_VERSION="2024-01"
   WEBHOOK_SECRET="your_webhook_secret"

   # Security
   SESSION_SECRET="your_session_secret"
   ENCRYPTION_KEY="your_32_byte_encryption_key"

   # Server
   PORT=3001
   NODE_ENV="development"
   ```

4. **Set up the database**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. **Create an admin user**
   ```bash
   npm run create-admin
   ```

6. **Start the development servers**

   Backend:
   ```bash
   npm run dev
   ```

   Frontend (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001


## Usage

### Connecting a Shopify Store

1. Log in to the dashboard with your admin credentials
2. Navigate to "Connect Store"
3. Enter your Shopify store domain (e.g., `mystore.myshopify.com`)
4. Authorize the app on Shopify's OAuth page
5. Wait for initial data sync to complete

### Viewing Analytics

The dashboard provides:

- **Summary Cards** - Quick overview of key metrics
- **Orders Chart** - Visual representation of order trends
- **Top Customers** - List of highest-value customers
- **Date Filters** - Analyze specific time periods

### API Endpoints

#### Authentication
```
POST   /api/auth/login       - User login
POST   /api/auth/logout      - User logout
GET    /api/auth/session     - Validate session
```

#### Shopify Integration
```
GET    /api/shopify/auth?shop=<shop_name>           - Initiate OAuth
GET    /api/shopify/callback?code=<code>&shop=<shop> - OAuth callback
```

#### Analytics
```
GET    /api/analytics/summary                        - Metrics, Top Products, and Top Customers
GET    /api/analytics/top-customers?limit=5          - Detailed top customer list
GET    /api/analytics/orders?from=<date>&to=<date>   - Filtered order history
GET    /api/analytics/export-orders                  - CSV order data generator
```

#### Webhooks
```
POST   /webhooks/orders/create      - Order creation webhook
POST   /webhooks/orders/update      - Order update webhook
POST   /webhooks/customers/create   - Customer creation webhook
```

## Project Structure

```
.
├── src/
│   ├── config/           # Configuration and environment
│   ├── middleware/       # Express middleware
│   ├── modules/          # Business logic modules
│   │   ├── analytics/    # Metrics and insights
│   │   ├── auth/         # Authentication
│   │   ├── ingestion/    # Data ingestion services
│   │   ├── shopify/      # Shopify integration
│   │   └── tenant/       # Tenant management
│   ├── routes/           # API route handlers
│   ├── utils/            # Utility functions
│   └── server.ts         # Application entry point
├── frontend/
│   └── src/
│       ├── app/          # Next.js pages
│       ├── components/   # React components
│       ├── contexts/     # React contexts
│       └── lib/          # Frontend utilities
├── prisma/
│   └── schema.prisma     # Database schema
└── scripts/              # Utility scripts
```

## Development

### Available Scripts

```bash
# Backend
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Lint code
npm run format           # Format code

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio

# Utilities
npm run create-admin     # Create admin user
npm run setup            # Run setup script
```

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Modular architecture with clear interfaces

### Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## Security

### Best Practices Implemented

- **Encryption at Rest** - AES-256 for access tokens
- **Password Hashing** - bcrypt with cost factor 10+
- **Session Management** - Secure token generation and validation
- **Webhook Verification** - HMAC-SHA256 signature validation
- **Input Validation** - All user inputs sanitized
- **SQL Injection Prevention** - Prisma ORM with parameterized queries
- **Rate Limiting** - API endpoint protection
- **CORS Configuration** - Restricted to frontend domain
- **Security Headers** - Helmet.js integration

### Environment Variables

Never commit sensitive data. Use environment variables for:
- Database credentials
- API keys and secrets
- Encryption keys
- Session secrets

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong encryption keys (32+ bytes)
- [ ] Enable SSL/TLS for database connections
- [ ] Configure CORS for production domain
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Set up automated backups
- [ ] Review security headers
- [ ] Test webhook endpoints
- [ ] Configure process manager (PM2)

### Deployment Options

**Local:**
```bash
npm run build
NODE_ENV=production npm start
```

**Cloud Platforms:**
- AWS (EC2, RDS)
- Google Cloud Platform
- Heroku
- DigitalOcean
- Railway

## Monitoring

### Logs

Logs are stored in the `logs/` directory:
- `error.log` - Error-level logs
- `combined.log` - All logs

### Health Checks

```bash
# Check API health
curl http://localhost:3001/health

# Check database connection
npm run prisma:studio
```

## Troubleshooting

### Common Issues

**Database Connection Failed**
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Ensure database exists

**OAuth Redirect Error**
- Verify Shopify app redirect URLs
- Check `SHOPIFY_API_KEY` and `SHOPIFY_API_SECRET`
- Ensure shop domain format is correct

**Webhook Not Receiving Events**
- Verify webhook URL is publicly accessible
- Check `WEBHOOK_SECRET` matches Shopify configuration
- Review webhook logs for signature validation errors

**Data Not Syncing**
- Check sync service logs
- Verify access token is valid
- Review rate limit logs

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Write clear, descriptive commit messages
- Add tests for new features
- Update documentation as needed
- Follow existing code style
- Ensure all tests pass before submitting

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Shopify API](https://shopify.dev/docs/api)
- Powered by [Prisma](https://www.prisma.io/)
- UI framework by [Next.js](https://nextjs.org/)

## Roadmap

- [ ] Advanced analytics (cohort analysis, LTV)
- [ ] Multi-currency support
- [x] Export functionality (CSV)
- [ ] Export functionality (PDF)
- [ ] Email notifications
- [ ] Mobile app
- [ ] GraphQL API
- [ ] Advanced filtering and search
- [ ] Custom dashboard widgets
- [ ] Team collaboration features
- [ ] API rate limit dashboard
