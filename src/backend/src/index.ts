import express, { type Express } from 'express';
import { prisma } from './infrastructure/prismaClient';
import { PrismaUserRepository } from './infrastructure/db/repositories/PrismaUserRepository';
import { PrismaWorkspaceRepository } from './infrastructure/db/repositories/PrismaWorkspaceRepository';
import { JwtService } from './infrastructure/auth/JwtService';
import { PasswordService } from './infrastructure/auth/PasswordService';
import { AuthService } from './application/identity/AuthService';
import { AuthController } from './presentation/controllers/auth.controller';
import { createAuthRouter } from './presentation/routes/auth.routes';
import { errorHandler } from './presentation/middleware/errorHandler';
import { logger } from './infrastructure/logger';

export function createApp(): Express {
  const app = express();
  app.use(express.json());

  // Infrastructure
  const userRepo = new PrismaUserRepository(prisma);
  const workspaceRepo = new PrismaWorkspaceRepository(prisma);
  const jwtService = new JwtService();
  const passwordService = new PasswordService();

  // Application
  const authService = new AuthService(userRepo, workspaceRepo, jwtService, passwordService);

  // Presentation
  const authController = new AuthController(authService);
  app.use('/api/auth', createAuthRouter(authController, jwtService));

  app.use(errorHandler);

  return app;
}

if (require.main === module) {
  const port = process.env['PORT'] ?? 3000;
  const app = createApp();
  app.listen(port, () => {
    logger.info({ port }, 'Server started');
  });
}
