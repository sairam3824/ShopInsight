# Quick Start Guide

## Current Issue

Your Supabase database connection is not working. This could be due to:
1. Incorrect password or credentials
2. Database not accessible from your network
3. Supabase project paused or deleted

## Solution Options

### Option 1: Use Local PostgreSQL (Recommended for Development)

1. **Install PostgreSQL locally:**
   - macOS: `brew install postgresql@14`
   - Windows: Download from https://www.postgresql.org/download/
   - Linux: `sudo apt-get install postgresql-14`

2. **Start PostgreSQL:**
   ```bash
   # macOS
   brew services start postgresql@14
   
   # Linux
   sudo systemctl start postgresql
   ```

3. **Create database:**
   ```bash
   psql -U postgres
   CREATE DATABASE shopify_dashboard;
   \q
   ```

4. **Update .env:**
   ```env
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/shopify_dashboard"
   ```

5. **Run migrations:**
   ```bash
   npx prisma migrate dev --name init
   ```

### Option 2: Use Docker PostgreSQL (Easiest)

1. **Start PostgreSQL with Docker:**
   ```bash
   docker run --name shopify-postgres \
     -e POSTGRES_USER=shopify_user \
     -e POSTGRES_PASSWORD=shopify_password \
     -e POSTGRES_DB=shopify_dashboard \
     -p 5432:5432 \
     -d postgres:14
   ```

2. **Update .env:**
   ```env
   DATABASE_URL="postgresql://shopify_user:shopify_password@localhost:5432/shopify_dashboard"
   ```

3. **Run migrations:**
   ```bash
   npx prisma migrate dev --name init
   ```

### Option 3: Fix Supabase Connection

1. **Check your Supabase dashboard:**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Go to Settings > Database
   - Copy the connection string

2. **Get the correct connection string:**
   - It should look like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`
   - Make sure to URL encode special characters in password

3. **Update .env with correct credentials**

4. **Test connection:**
   ```bash
   npx prisma db pull
   ```

## After Database is Connected

### Step 1: Run Migrations
```bash
npx prisma migrate dev --name init
```

### Step 2: Create Test User
```bash
npm run create-test-user
```

This creates:
- Username: `testuser`
- Password: `password123`

### Step 3: Start Backend
```bash
npm run dev
```

Backend will run on: http://localhost:3000

### Step 4: Start Frontend (New Terminal)
```bash
cd frontend
npm install  # if not done already
npm run dev
```

Frontend will run on: http://localhost:3001

### Step 5: Access Application
1. Open browser: http://localhost:3001
2. Login with: `testuser` / `password123`
3. View the dashboard!

## Verify Setup

### Check Backend Health
```bash
curl http://localhost:3000/health
```

Should return: `{"status":"ok"}`

### Check Database
```bash
npx prisma studio
```

Opens GUI at: http://localhost:5555

## Complete Environment Variables

Your `.env` should have all these:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# Shopify API (Get from Shopify Partner Dashboard)
SHOPIFY_API_VERSION="2024-01"
SHOPIFY_API_KEY="your_actual_api_key"
SHOPIFY_API_SECRET="your_actual_api_secret"

# Security
SESSION_SECRET="your_random_session_secret_here"
WEBHOOK_SECRET="your_shopify_webhook_secret_here"
ENCRYPTION_KEY="your_32_character_encryption_key"

# Server
PORT=3000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3001"
```

## Troubleshooting

### "Can't reach database server"
- Check if PostgreSQL is running
- Verify credentials are correct
- Check firewall/network settings

### "Port already in use"
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### "Module not found"
```bash
npm install
cd frontend && npm install
```

### "Prisma Client not generated"
```bash
npx prisma generate
```

## Need Help?

1. Check if PostgreSQL is running: `pg_isready`
2. Test database connection: `npx prisma db pull`
3. View logs: Check `logs/combined.log`
4. Check README.md for detailed documentation

## Recommended: Use Docker for Quick Setup

The easiest way to get started:

```bash
# Start PostgreSQL
docker run --name shopify-postgres \
  -e POSTGRES_USER=shopify_user \
  -e POSTGRES_PASSWORD=shopify_password \
  -e POSTGRES_DB=shopify_dashboard \
  -p 5432:5432 \
  -d postgres:14

# Update .env
DATABASE_URL="postgresql://shopify_user:shopify_password@localhost:5432/shopify_dashboard"

# Run migrations
npx prisma migrate dev --name init

# Create test user
npm run create-test-user

# Start backend
npm run dev

# In new terminal, start frontend
cd frontend && npm run dev
```

Then access: http://localhost:3001
