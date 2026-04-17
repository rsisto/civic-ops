import type { Request, Response, NextFunction } from 'express';
import { logger } from '../../infrastructure/logger';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(err: AppError, _req: Request, res: Response, _next: NextFunction): void {
  const statusCode = err.statusCode ?? 500;
  const code = err.code ?? 'INTERNAL_ERROR';

  if (statusCode >= 500) {
    logger.error({ err }, 'Unhandled error');
  }

  res.status(statusCode).json({
    success: false,
    error: { code, message: statusCode < 500 ? err.message : 'Internal server error' },
  });
}
