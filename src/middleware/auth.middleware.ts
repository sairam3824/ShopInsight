import { Request, Response, NextFunction } from 'express';
import { validateSession } from '../modules/auth/session';

export interface AuthRequest extends Request {
  session?: {
    id: string;
    userId: string;
    tenantId: string;
    token: string;
    expiresAt: Date;
  };
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: { code: 'AUTH_MISSING_TOKEN', message: 'Missing authorization token' } });
      return;
    }

    const token = authHeader.substring(7);
    const session = await validateSession(token);

    if (!session) {
      res.status(401).json({ error: { code: 'AUTH_SESSION_EXPIRED', message: 'Session expired or invalid' } });
      return;
    }

    req.session = session;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' } });
  }
}
