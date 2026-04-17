import { Router } from 'express';
import type { AuthController } from '../controllers/auth.controller';
import type { JwtService } from '../../infrastructure/auth/JwtService';
import { createAuthMiddleware } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validateBody';
import { signupSchema, loginSchema, refreshSchema } from '../dto/auth.dto';

export function createAuthRouter(controller: AuthController, jwtService: JwtService): Router {
  const router = Router();
  const auth = createAuthMiddleware(jwtService);

  router.post('/signup', validateBody(signupSchema), (req, res, next) => { controller.signup(req, res, next).catch(next); });
  router.post('/login', validateBody(loginSchema), (req, res, next) => { controller.login(req, res, next).catch(next); });
  router.post('/refresh', validateBody(refreshSchema), (req, res, next) => { controller.refresh(req, res, next).catch(next); });
  router.get('/me', auth, (req, res, next) => { controller.me(req, res, next).catch(next); });

  return router;
}
