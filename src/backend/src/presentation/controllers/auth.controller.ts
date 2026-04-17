import type { Request, Response, NextFunction } from 'express';
import type { AuthService } from '../../application/identity/AuthService';
import type { SignupInput, LoginInput } from '../../application/identity/dto';
import { UnauthorizedError } from '../../domain/identity/errors';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.authService.signup(req.body as SignupInput);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.authService.login(req.body as LoginInput);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body as { refreshToken: string };
      const result = await this.authService.refresh(refreshToken);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user;
      if (!user) { next(new UnauthorizedError()); return; }
      const result = await this.authService.getMe(user.userId, user.workspaceId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}
