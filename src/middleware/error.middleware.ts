import { Request, Response, NextFunction } from 'express';

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
    retryable: boolean;
  };
  requestId: string;
  timestamp: string;
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Generate request ID
  const requestId = req.headers['x-request-id'] as string || generateRequestId();
  const timestamp = new Date().toISOString();

  // Log error with context
  console.error('Error occurred:', {
    requestId,
    timestamp,
    method: req.method,
    path: req.path,
    error: {
      message: err.message,
      stack: err.stack,
      code: err.code,
    },
  });

  // Determine error type and response
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let errorMessage = 'An unexpected error occurred';
  let retryable = false;

  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    errorMessage = err.message;
    retryable = false;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    errorCode = 'AUTH_UNAUTHORIZED';
    errorMessage = 'Unauthorized access';
    retryable = false;
  } else if (err.code === 'P2002') {
    // Prisma unique constraint violation
    statusCode = 409;
    errorCode = 'DUPLICATE_ENTRY';
    errorMessage = 'Resource already exists';
    retryable = false;
  } else if (err.code === 'P2025') {
    // Prisma record not found
    statusCode = 404;
    errorCode = 'NOT_FOUND';
    errorMessage = 'Resource not found';
    retryable = false;
  } else if (err.message?.includes('rate limit')) {
    statusCode = 429;
    errorCode = 'RATE_LIMIT_EXCEEDED';
    errorMessage = 'Rate limit exceeded';
    retryable = true;
  }

  const errorResponse: ErrorResponse = {
    error: {
      code: errorCode,
      message: errorMessage,
      retryable,
    },
    requestId,
    timestamp,
  };

  // Don't expose internal details in production
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.details = {
      originalMessage: err.message,
      stack: err.stack,
    };
  }

  res.status(statusCode).json(errorResponse);
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

// 404 handler
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
      retryable: false,
    },
    requestId: generateRequestId(),
    timestamp: new Date().toISOString(),
  });
}
