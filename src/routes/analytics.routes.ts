import { Router, Response } from 'express';
import { metricsService } from '../modules/analytics/metrics.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET /api/analytics/summary
router.get('/summary', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.session!.tenantId;
    const metrics = await metricsService.getDashboardMetrics(tenantId);

    res.json(metrics);
  } catch (error) {
    console.error('Get dashboard metrics error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch dashboard metrics',
      },
    });
  }
});

// GET /api/analytics/top-customers?limit=5
router.get('/top-customers', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.session!.tenantId;
    const limit = parseInt(req.query.limit as string) || 5;

    if (limit < 1 || limit > 100) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Limit must be between 1 and 100',
        },
      });
      return;
    }

    const topCustomers = await metricsService.getTopCustomers(tenantId, limit);

    res.json({ topCustomers });
  } catch (error) {
    console.error('Get top customers error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch top customers',
      },
    });
  }
});

// GET /api/analytics/orders?from=<date>&to=<date>
router.get('/orders', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.session!.tenantId;
    const { from, to } = req.query;

    if (!from || !to) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Both from and to date parameters are required',
        },
      });
      return;
    }

    const startDate = new Date(from as string);
    const endDate = new Date(to as string);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_INVALID_DATE',
          message: 'Invalid date format',
        },
      });
      return;
    }

    if (startDate > endDate) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Start date must be before end date',
        },
      });
      return;
    }

    const orders = await metricsService.getOrdersByDateRange(tenantId, startDate, endDate);

    res.json({ orders });
  } catch (error) {
    console.error('Get orders by date range error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch orders',
      },
    });
  }
});

export default router;
