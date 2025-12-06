# Deployment Guide

This guide covers deploying the Shopify Multi-Tenant Dashboard to production.

## Prerequisites

- Docker and Docker Compose installed
- PostgreSQL database (managed service recommended)
- Domain name with SSL certificate
- Shopify Partner account with API credentials

## Environment Setup

### Backend Environment Variables

Create a `.env` file with production values:

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
SHOPIFY_API_VERSION="2024-01"
SHOPIFY_API_KEY="your_production_api_key"
SHOPIFY_API_SECRET="your_production_api_secret"
SESSION_SECRET="generate_a_secure_random_string_min_32_chars"
WEBHOOK_SECRET="your_webhook_secret_from_shopify"
ENCRYPTION_KEY="generate_a_secure_32_char_encryption_key"
PORT=3000
NODE_ENV="production"
FRONTEND_URL="https://your-frontend-domain.com"
```

### Frontend Environment Variables

Create `frontend/.env.production`:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

## Deployment Options

### Option 1: Docker Compose (Recommended for Quick Setup)

1. Build and start services:
```bash
docker-compose up -d
```

2. Run database migrations:
```bash
docker-compose exec backend npx prisma migrate deploy
```

3. Create initial user:
```bash
docker-compose exec backend npm run create-test-user
```

### Option 2: Manual Deployment

#### Backend Deployment

1. Build the application:
```bash
npm run build
```

2. Run database migrations:
```bash
npx prisma migrate deploy
```

3. Start the server:
```bash
npm start
```

#### Frontend Deployment

1. Build the application:
```bash
cd frontend
npm run build
```

2. Start the server:
```bash
npm start
```

### Option 3: Cloud Platform Deployment

#### AWS Deployment

**Backend (Elastic Beanstalk or ECS):**
1. Create RDS PostgreSQL instance
2. Deploy backend using Elastic Beanstalk or ECS
3. Configure environment variables
4. Set up Application Load Balancer
5. Configure SSL certificate

**Frontend (Amplify or Vercel):**
1. Connect GitHub repository
2. Configure build settings
3. Set environment variables
4. Deploy

#### Heroku Deployment

**Backend:**
```bash
heroku create your-app-name
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set SHOPIFY_API_KEY=your_key
heroku config:set SHOPIFY_API_SECRET=your_secret
# Set other environment variables
git push heroku main
heroku run npx prisma migrate deploy
```

**Frontend:**
```bash
cd frontend
heroku create your-frontend-app
heroku config:set NEXT_PUBLIC_API_URL=https://your-backend.herokuapp.com
git push heroku main
```

## Database Setup

### Production Database

1. Use a managed PostgreSQL service (AWS RDS, Google Cloud SQL, or Heroku Postgres)
2. Enable SSL connections
3. Set up automated backups
4. Configure connection pooling

### Run Migrations

```bash
npx prisma migrate deploy
```

## Security Checklist

- [ ] All environment variables are set correctly
- [ ] Database uses SSL connections
- [ ] Encryption keys are securely generated and stored
- [ ] CORS is configured for your frontend domain only
- [ ] Rate limiting is enabled
- [ ] Helmet.js security headers are active
- [ ] Webhook secrets are configured
- [ ] Session secrets are strong and unique
- [ ] Database backups are automated
- [ ] Monitoring and logging are set up

## Monitoring Setup

### Application Monitoring

1. Set up error tracking (Sentry, Rollbar)
2. Configure APM (New Relic, Datadog)
3. Set up uptime monitoring
4. Configure log aggregation

### Database Monitoring

1. Monitor query performance
2. Set up alerts for slow queries
3. Monitor connection pool usage
4. Track database size growth

## Backup Strategy

### Database Backups

1. Automated daily backups
2. Point-in-time recovery enabled
3. Backup retention: 30 days
4. Test restore procedures monthly

### Application Backups

1. Version control (Git)
2. Docker image registry
3. Configuration backups

## Rollback Plan

### Backend Rollback

1. Keep previous Docker image
2. Revert to previous Git commit
3. Rollback database migrations if needed:
```bash
npx prisma migrate resolve --rolled-back <migration_name>
```

### Frontend Rollback

1. Revert to previous deployment
2. Clear CDN cache if applicable

## Performance Optimization

### Backend

1. Enable response compression
2. Configure connection pooling (max 20 connections)
3. Implement caching for analytics queries
4. Use database indexes effectively

### Frontend

1. Enable Next.js production optimizations
2. Configure CDN for static assets
3. Implement lazy loading
4. Optimize images

## Scaling Considerations

### Horizontal Scaling

1. Backend: Deploy multiple instances behind load balancer
2. Database: Use read replicas for analytics queries
3. Frontend: Deploy to CDN

### Vertical Scaling

1. Increase server resources as needed
2. Optimize database queries
3. Implement caching layer (Redis)

## Troubleshooting

### Common Issues

**Database Connection Errors:**
- Check DATABASE_URL format
- Verify SSL mode is correct
- Check firewall rules

**Shopify API Errors:**
- Verify API credentials
- Check API version compatibility
- Monitor rate limits

**Session Issues:**
- Verify SESSION_SECRET is set
- Check session expiration settings
- Verify CORS configuration

## Maintenance

### Regular Tasks

- [ ] Review logs weekly
- [ ] Monitor error rates
- [ ] Check database performance
- [ ] Update dependencies monthly
- [ ] Review security advisories
- [ ] Test backup restoration quarterly

### Updates

1. Test updates in staging environment
2. Run database migrations
3. Deploy during low-traffic periods
4. Monitor for errors post-deployment
5. Keep rollback plan ready

## Support

For issues and questions:
- Check logs: `docker-compose logs -f backend`
- Review error tracking dashboard
- Contact support team

## Production Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Database migrations completed
- [ ] SSL certificates installed
- [ ] Monitoring and alerting configured
- [ ] Backup strategy implemented
- [ ] Security checklist completed
- [ ] Performance testing done
- [ ] Rollback plan documented
- [ ] Team trained on deployment process
- [ ] Documentation updated
