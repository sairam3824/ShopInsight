# Production Setup Guide

This application now requires proper authentication. All bypass mechanisms have been removed for security.

## Prerequisites

- PostgreSQL database (local or cloud)
- Shopify Partner account with API credentials
- Node.js 18+

## Setup Steps

### 1. Configure Database

Update `.env` with your database connection:

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
```

**Options:**
- **Local PostgreSQL**: `postgresql://postgres:password@localhost:5432/shopify_dashboard`
- **Supabase**: `postgresql://postgres:password@db.xxx.supabase.co:5432/postgres?sslmode=require`
- **Heroku**: Provided automatically via `DATABASE_URL`
- **AWS RDS**: `postgresql://user:password@xxx.rds.amazonaws.com:5432/dbname`

### 2. Configure Shopify API

Get credentials from [Shopify Partner Dashboard](https://partners.shopify.com/):

```env
SHOPIFY_API_VERSION="2024-01"
SHOPIFY_API_KEY="your_actual_api_key"
SHOPIFY_API_SECRET="your_actual_api_secret"
```

### 3. Generate Security Keys

Generate secure random strings:

```bash
# Generate SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Generate ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Update `.env`:
```env
SESSION_SECRET="your_generated_session_secret"
WEBHOOK_SECRET="your_shopify_webhook_secret"
ENCRYPTION_KEY="your_generated_encryption_key"
```

### 4. Run Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

### 5. Create Admin User

You need to create users manually via database or API:

**Option A: Using Prisma Studio**
```bash
npx prisma studio
```
1. Open http://localhost:5555
2. Go to "User" table
3. Create a new user with:
   - username: your_username
   - passwordHash: (use bcrypt to hash your password)
   - tenantId: (link to a tenant)

**Option B: Using SQL**
```sql
-- First, create a tenant
INSERT INTO "Tenant" (id, "shopName", "accessToken", "createdAt", "updatedAt")
VALUES ('tenant-1', 'your-store.myshopify.com', 'encrypted_token', NOW(), NOW());

-- Then create a user (password must be bcrypt hashed)
INSERT INTO "User" (id, username, "passwordHash", "tenantId", "createdAt", "updatedAt")
VALUES ('user-1', 'admin', '$2b$10$...hashed_password...', 'tenant-1', NOW(), NOW());
```

**Option C: Create a Setup Script**

Create `scripts/create-admin.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/encryption';

const prisma = new PrismaClient();

async function createAdmin() {
  const username = process.argv[2];
  const password = process.argv[3];
  const shopName = process.argv[4];

  if (!username || !password || !shopName) {
    console.error('Usage: npm run create-admin <username> <password> <shop-name>');
    process.exit(1);
  }

  const tenant = await prisma.tenant.create({
    data: {
      shopName,
      accessToken: 'placeholder_token',
    },
  });

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      username,
      passwordHash,
      tenantId: tenant.id,
    },
  });

  console.log('✅ Admin user created:', user.username);
  await prisma.$disconnect();
}

createAdmin();
```

Then run:
```bash
npx ts-node scripts/create-admin.ts admin mypassword store.myshopify.com
```

### 6. Start the Application

```bash
# Start backend
npm run dev

# Start frontend (new terminal)
cd frontend
npm run dev
```

### 7. Connect Shopify Store

1. Go to: `http://localhost:3000/api/shopify/auth?shop=your-store.myshopify.com`
2. Authorize the app
3. System will automatically sync data

### 8. Access Dashboard

1. Go to: http://localhost:3001
2. Login with your created credentials
3. View your Shopify analytics!

## Production Deployment

### Environment Variables Checklist

Ensure all these are set:

```env
# Database
DATABASE_URL="postgresql://..."

# Shopify
SHOPIFY_API_VERSION="2024-01"
SHOPIFY_API_KEY="..."
SHOPIFY_API_SECRET="..."

# Security (all must be strong random strings)
SESSION_SECRET="..."
WEBHOOK_SECRET="..."
ENCRYPTION_KEY="..."

# Server
PORT=3000
NODE_ENV="production"
FRONTEND_URL="https://your-frontend-domain.com"
```

### Security Checklist

- [ ] All environment variables are set
- [ ] Secrets are strong random strings (32+ characters)
- [ ] Database uses SSL (`?sslmode=require`)
- [ ] `NODE_ENV=production`
- [ ] CORS configured for your domain only
- [ ] Rate limiting enabled
- [ ] Webhook secrets configured
- [ ] No test/bypass code in production

### Deployment Options

See `DEPLOYMENT.md` for detailed deployment instructions for:
- Docker
- Heroku
- AWS
- Vercel (frontend)

## User Management

### Creating New Users

Users must be associated with a tenant (Shopify store). To create a new user:

1. Ensure tenant exists (created via OAuth flow)
2. Create user with hashed password
3. Link user to tenant

### Password Reset

Implement password reset by:
1. Generating reset token
2. Sending email with reset link
3. Validating token and updating password

(Not implemented in current version - add as needed)

## Monitoring

### Health Check

```bash
curl http://localhost:3000/health
```

### Database Status

```bash
npx prisma studio
```

### Logs

Check application logs:
```bash
tail -f logs/combined.log
tail -f logs/error.log
```

## Troubleshooting

### Cannot Login

1. Verify user exists in database
2. Check password is correctly hashed
3. Verify tenant association
4. Check session secret is set

### No Data Showing

1. Verify Shopify OAuth completed
2. Check sync service is running
3. Verify tenant has access token
4. Check logs for errors

### Database Connection Failed

1. Verify DATABASE_URL is correct
2. Check database is accessible
3. Verify SSL mode if required
4. Check firewall rules

## Support

For issues:
1. Check logs in `logs/` directory
2. Review `README.md` for documentation
3. Check `DEPLOYMENT.md` for deployment help
4. Review Prisma schema for database structure

## Security Notes

⚠️ **Important Security Practices:**

1. **Never commit `.env` files** - they contain secrets
2. **Use strong passwords** - minimum 12 characters
3. **Rotate secrets regularly** - especially after team changes
4. **Enable SSL/TLS** - for database and API connections
5. **Monitor logs** - for suspicious activity
6. **Keep dependencies updated** - run `npm audit` regularly
7. **Backup database** - regularly and test restores
8. **Use HTTPS** - in production for all connections

## Next Steps

1. ✅ Set up database
2. ✅ Configure environment variables
3. ✅ Run migrations
4. ✅ Create admin user
5. ✅ Start application
6. ✅ Connect Shopify store
7. ✅ Test login and dashboard
8. ✅ Deploy to production
9. ✅ Set up monitoring
10. ✅ Configure backups
