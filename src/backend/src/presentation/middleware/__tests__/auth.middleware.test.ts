import type { Request, Response, NextFunction } from 'express';
import { createAuthMiddleware } from '../auth.middleware';
import { InvalidTokenError } from '../../../domain/identity/errors';
import { Role } from '../../../domain/identity/Role';

const makeJwtService = () => ({
  verifyAccess: jest.fn(),
  verifyRefresh: jest.fn(),
  signPair: jest.fn(),
  signAccess: jest.fn(),
});

const makeReq = (authHeader?: string): Partial<Request> => ({
  headers: authHeader ? { authorization: authHeader } : {},
});

const makeRes = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const next: NextFunction = jest.fn();

describe('createAuthMiddleware', () => {
  let jwtService: ReturnType<typeof makeJwtService>;

  beforeEach(() => {
    jest.clearAllMocks();
    jwtService = makeJwtService();
  });

  it('sets req.user and calls next() when token is valid', () => {
    jwtService.verifyAccess.mockReturnValue({
      sub: 'user_01',
      workspaceId: 'ws_01',
      role: Role.ADMIN,
      type: 'access',
    });

    const req = makeReq('Bearer valid-token') as Request;
    const res = makeRes() as Response;
    const middleware = createAuthMiddleware(jwtService as never);

    middleware(req, res, next);

    expect(req.user).toEqual({ userId: 'user_01', workspaceId: 'ws_01', role: Role.ADMIN });
    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 401 when Authorization header is missing', () => {
    const req = makeReq() as Request;
    const res = makeRes() as Response;
    const middleware = createAuthMiddleware(jwtService as never);

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when Authorization header does not start with Bearer', () => {
    const req = makeReq('Basic abc123') as Request;
    const res = makeRes() as Response;
    const middleware = createAuthMiddleware(jwtService as never);

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when token verification fails', () => {
    jwtService.verifyAccess.mockImplementation(() => { throw new InvalidTokenError(); });

    const req = makeReq('Bearer bad-token') as Request;
    const res = makeRes() as Response;
    const middleware = createAuthMiddleware(jwtService as never);

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
