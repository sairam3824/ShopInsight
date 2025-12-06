import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import shopifyRoutes from './routes/shopify.routes';
import analyticsRoutes from './routes/analytics.routes';
import webhookRoutes from './routes/webhook.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { rateLimitMiddleware } from './middleware/rateLimit.middleware';
import { syncService } from './modules/shopify/sync.service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rate limiting
app.use(rateLimitMiddleware);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/shopify', shopifyRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/webhooks', webhookRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start sync service (10 minute interval)
  syncService.startScheduledSync(10);
  console.log('Sync service started');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  syncService.stopScheduledSync();
  process.exit(0);
});

export default app;
