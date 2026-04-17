import jwt from 'jsonwebtoken';
import { InvalidTokenError } from '../../domain/identity/errors';
import type { Role } from '../../domain/identity/Role';

export type JwtPayload = {
  sub: string;
  workspaceId: string;
  role: Role | string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
};

type SignInput = {
  userId: string;
  workspaceId: string;
  role: Role | string;
};

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export class JwtService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiresIn: string;
  private readonly refreshExpiresIn: string;

  constructor() {
    this.accessSecret = requireEnv('JWT_ACCESS_SECRET');
    this.refreshSecret = requireEnv('JWT_REFRESH_SECRET');
    this.accessExpiresIn = process.env['JWT_ACCESS_EXPIRES_IN'] ?? '15m';
    this.refreshExpiresIn = process.env['JWT_REFRESH_EXPIRES_IN'] ?? '7d';
  }

  signAccess(input: SignInput): string {
    return jwt.sign(
      { sub: input.userId, workspaceId: input.workspaceId, role: input.role, type: 'access' },
      this.accessSecret,
      { expiresIn: this.accessExpiresIn } as jwt.SignOptions,
    );
  }

  signRefresh(input: SignInput): string {
    return jwt.sign(
      { sub: input.userId, workspaceId: input.workspaceId, role: input.role, type: 'refresh' },
      this.refreshSecret,
      { expiresIn: this.refreshExpiresIn } as jwt.SignOptions,
    );
  }

  signPair(input: SignInput): { accessToken: string; refreshToken: string } {
    return {
      accessToken: this.signAccess(input),
      refreshToken: this.signRefresh(input),
    };
  }

  verifyAccess(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.accessSecret);
      if (typeof decoded === 'string') throw new InvalidTokenError();
      const payload = decoded as JwtPayload;
      if (payload.type !== 'access') throw new InvalidTokenError();
      return payload;
    } catch (err) {
      if (err instanceof InvalidTokenError) throw err;
      throw new InvalidTokenError();
    }
  }

  verifyRefresh(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.refreshSecret);
      if (typeof decoded === 'string') throw new InvalidTokenError();
      const payload = decoded as JwtPayload;
      if (payload.type !== 'refresh') throw new InvalidTokenError();
      return payload;
    } catch (err) {
      if (err instanceof InvalidTokenError) throw err;
      throw new InvalidTokenError();
    }
  }
}
