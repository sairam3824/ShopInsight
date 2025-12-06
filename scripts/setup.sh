#!/bin/bash

echo "🚀 Setting up Shopify Multi-Tenant Dashboard..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL not found. Please ensure PostgreSQL is installed and running."
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your actual credentials!"
fi

# Check if frontend .env.local exists
if [ ! -f frontend/.env.local ]; then
    echo "📝 Creating frontend .env.local..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > frontend/.env.local
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your database and Shopify credentials"
echo "2. Run 'npm run prisma:migrate' to set up the database"
echo "3. Run 'npm run dev' to start the backend"
echo "4. In a new terminal, run 'cd frontend && npm run dev' to start the frontend"
echo ""
echo "Backend will be available at: http://localhost:3000"
echo "Frontend will be available at: http://localhost:3001"
