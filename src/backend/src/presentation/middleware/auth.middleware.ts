import type { Request, Response, NextFunction } from 'express';
import type { JwtService } from '../../infrastructure/auth/JwtService';

export function createAuthMiddleware(jwtService: Pick<JwtService, 'verifyAccess'>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing or invalid token' } });
      return;
    }

    const token = authHeader.slice(7);
    try {
      const payload = jwtService.verifyAccess(token);
      req.user = { userId: payload.sub, workspaceId: payload.workspaceId, role: payload.role };
      next();
    } catch {
      res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Token is invalid or expired' } });
    }
  };
}
