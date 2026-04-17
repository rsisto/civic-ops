import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';

export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: result.error.errors },
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
