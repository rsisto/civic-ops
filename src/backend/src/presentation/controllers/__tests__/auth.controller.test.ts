import type { Request, Response, NextFunction } from 'express';
import { AuthController } from '../auth.controller';
import { EmailAlreadyExistsError } from '../../../domain/identity/errors';

const makeAuthService = () => ({
  signup: jest.fn(),
  login: jest.fn(),
  refresh: jest.fn(),
  getMe: jest.fn(),
});

const makeReq = (body = {}, user = {}): Partial<Request> => ({ body, user: user as Request['user'] });

const makeRes = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('AuthController', () => {
  let authService: ReturnType<typeof makeAuthService>;
  let controller: AuthController;
  const next: NextFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    authService = makeAuthService();
    controller = new AuthController(authService as never);
  });

  describe('signup', () => {
    it('returns 201 with user, workspace, and tokens on success', async () => {
      const payload = {
        user: { id: 'u1', email: 'a@b.com', name: 'A' },
        workspace: { id: 'w1', name: 'W', slug: 'w' },
        tokens: { accessToken: 'acc', refreshToken: 'ref' },
      };
      authService.signup.mockResolvedValue(payload);

      const req = makeReq({ email: 'a@b.com', name: 'A', password: 'pw123456' });
      const res = makeRes() as Response;

      await controller.signup(req as Request, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: payload });
      expect(next).not.toHaveBeenCalled();
    });

    it('calls next(error) when AuthService throws', async () => {
      const error = new EmailAlreadyExistsError();
      authService.signup.mockRejectedValue(error);

      const req = makeReq({ email: 'a@b.com', name: 'A', password: 'pw' });
      const res = makeRes() as Response;

      await controller.signup(req as Request, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('returns 200 with tokens on success', async () => {
      const payload = {
        user: { id: 'u1', email: 'a@b.com', name: 'A' },
        workspace: { id: 'w1', name: 'W', slug: 'w' },
        tokens: { accessToken: 'acc', refreshToken: 'ref' },
      };
      authService.login.mockResolvedValue(payload);

      const req = makeReq({ email: 'a@b.com', password: 'pw' });
      const res = makeRes() as Response;

      await controller.login(req as Request, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: payload });
    });

    it('calls next(error) on failure', async () => {
      authService.login.mockRejectedValue(new Error('fail'));
      const res = makeRes() as Response;

      await controller.login(makeReq() as Request, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('returns 200 with new accessToken', async () => {
      authService.refresh.mockResolvedValue({ accessToken: 'new-acc' });

      const req = makeReq({ refreshToken: 'ref' });
      const res = makeRes() as Response;

      await controller.refresh(req as Request, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { accessToken: 'new-acc' } });
    });

    it('calls next(error) on failure', async () => {
      authService.refresh.mockRejectedValue(new Error('bad'));
      const res = makeRes() as Response;

      await controller.refresh(makeReq({ refreshToken: 'bad' }) as Request, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('me', () => {
    it('returns 200 with user, workspace, and role', async () => {
      const payload = {
        user: { id: 'u1', email: 'a@b.com', name: 'A' },
        workspace: { id: 'w1', name: 'W', slug: 'w' },
        role: 'ADMIN',
      };
      authService.getMe.mockResolvedValue(payload);

      const req = makeReq({}, { userId: 'u1', workspaceId: 'w1', role: 'ADMIN' });
      const res = makeRes() as Response;

      await controller.me(req as Request, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: payload });
    });
  });
});
