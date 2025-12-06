# Shopify Dashboard Frontend

Next.js 14 frontend application for the Shopify Multi-Tenant Dashboard.

## Features

- User authentication with session management
- Dashboard with real-time metrics
- Top customers analytics
- Orders chart with date range filtering
- Responsive design for mobile and desktop

## Tech Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- Recharts for data visualization
- Axios for API calls

## Getting Started

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

3. Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3001`

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── dashboard/    # Dashboard page
│   │   ├── login/        # Login page
│   │   └── layout.tsx    # Root layout
│   ├── components/       # React components
│   ├── contexts/         # React contexts (Auth)
│   └── lib/              # Utilities (API client)
├── public/               # Static assets
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | http://localhost:3000 |

## Building for Production

```bash
npm run build
npm start
```
