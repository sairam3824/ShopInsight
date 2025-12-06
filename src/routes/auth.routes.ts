import { Router, Request, Response } from 'express';
import { createSession, deleteSession, validateSession } from '../modules/auth/session';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Username and password are required',
        },
      });
      return;
    }

    const session = await createSession(username, password);

    res.json({
      token: session.token,
      expiresAt: session.expiresAt,
      userId: session.userId,
      tenantId: session.tenantId,
    });
  } catch (error: any) {
    if (error.message === 'Invalid credentials') {
      res.status(401).json({
        error: {
          code: 'AUTH_INVALID_CREDENTIALS',
          message: 'Invalid username or password',
        },
      });
      return;
    }

    console.error('Login error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
      },
    });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing authorization token',
        },
      });
      return;
    }

    const token = authHeader.substring(7);
    await deleteSession(token);

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
      },
    });
  }
});

// GET /api/auth/session
router.get('/session', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: {
          code: 'AUTH_MISSING_TOKEN',
          message: 'Missing authorization token',
        },
      });
      return;
    }

    const token = authHeader.substring(7);
    const session = await validateSession(token);

    if (!session) {
      res.status(401).json({
        error: {
          code: 'AUTH_SESSION_EXPIRED',
          message: 'Session expired or invalid',
        },
      });
      return;
    }

    res.json({
      userId: session.userId,
      tenantId: session.tenantId,
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    console.error('Session validation error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
      },
    });
  }
});

export default router;
