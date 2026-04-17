import { AuthService } from '../AuthService';
import { IUserRepository } from '../../../domain/identity/repositories/IUserRepository';
import { IWorkspaceRepository } from '../../../domain/identity/repositories/IWorkspaceRepository';
import { User } from '../../../domain/identity/User';
import { Workspace } from '../../../domain/identity/Workspace';
import { Role } from '../../../domain/identity/Role';
import { EmailAlreadyExistsError, InvalidCredentialsError, InvalidTokenError } from '../../../domain/identity/errors';

const makeUser = (overrides = {}): User =>
  new User({ id: 'user_01', email: 'test@test.com', name: 'Test', passwordHash: 'hash', ...overrides });

const makeWorkspace = (): Workspace =>
  new Workspace({ id: 'ws_01', name: 'Test workspace', slug: 'test-workspace' });

const makeMembership = () => ({
  workspace: makeWorkspace(),
  workspaceId: 'ws_01',
  role: Role.ADMIN,
});

const makeUserRepo = (): jest.Mocked<IUserRepository> => ({
  findByEmail: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
});

const makeWorkspaceRepo = (): jest.Mocked<IWorkspaceRepository> => ({
  findBySlug: jest.fn(),
  createWithOwner: jest.fn(),
  findPrimaryMembership: jest.fn(),
  findMembership: jest.fn(),
});

const makeJwtService = () => ({
  signPair: jest.fn().mockReturnValue({ accessToken: 'acc', refreshToken: 'ref' }),
  signAccess: jest.fn().mockReturnValue('acc2'),
  verifyAccess: jest.fn(),
  verifyRefresh: jest.fn(),
});

const makePasswordService = () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
  compare: jest.fn(),
});

describe('AuthService', () => {
  let userRepo: jest.Mocked<IUserRepository>;
  let workspaceRepo: jest.Mocked<IWorkspaceRepository>;
  let jwtService: ReturnType<typeof makeJwtService>;
  let passwordService: ReturnType<typeof makePasswordService>;
  let authService: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepo = makeUserRepo();
    workspaceRepo = makeWorkspaceRepo();
    jwtService = makeJwtService();
    passwordService = makePasswordService();
    authService = new AuthService(userRepo, workspaceRepo, jwtService as never, passwordService as never);
  });

  describe('signup', () => {
    it('creates user and workspace and returns tokens', async () => {
      userRepo.findByEmail.mockResolvedValue(null);
      userRepo.save.mockResolvedValue(makeUser());
      workspaceRepo.findBySlug.mockResolvedValue(null);
      workspaceRepo.createWithOwner.mockResolvedValue(makeWorkspace());

      const result = await authService.signup({
        email: 'test@test.com',
        name: 'Test',
        password: 'password123',
      });

      expect(result.tokens.accessToken).toBe('acc');
      expect(result.user.email).toBe('test@test.com');
      expect(result.workspace.slug).toBe('test-workspace');
    });

    it('throws EmailAlreadyExistsError when email is taken', async () => {
      userRepo.findByEmail.mockResolvedValue(makeUser());

      await expect(
        authService.signup({ email: 'test@test.com', name: 'Test', password: 'password123' }),
      ).rejects.toThrow(EmailAlreadyExistsError);

      expect(userRepo.save).not.toHaveBeenCalled();
    });

    it('appends a suffix to the slug when slug already exists', async () => {
      userRepo.findByEmail.mockResolvedValue(null);
      userRepo.save.mockResolvedValue(makeUser());
      workspaceRepo.findBySlug.mockResolvedValue(makeWorkspace()); // slug taken
      workspaceRepo.createWithOwner.mockResolvedValue(makeWorkspace());

      await authService.signup({ email: 'test@test.com', name: 'Test', password: 'password123' });

      const slugUsed = workspaceRepo.createWithOwner.mock.calls[0]?.[0]?.slug ?? '';
      expect(slugUsed).not.toBe('tests-workspace');
      expect(slugUsed.length).toBeGreaterThan('test'.length);
    });
  });

  describe('login', () => {
    it('returns tokens when credentials are valid', async () => {
      const user = makeUser();
      userRepo.findByEmail.mockResolvedValue(user);
      passwordService.compare.mockResolvedValue(true);
      workspaceRepo.findPrimaryMembership.mockResolvedValue(makeMembership());

      const result = await authService.login({ email: 'test@test.com', password: 'pw' });

      expect(result.tokens.accessToken).toBe('acc');
    });

    it('throws InvalidCredentialsError when email is not found', async () => {
      userRepo.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'unknown@test.com', password: 'pw' }),
      ).rejects.toThrow(InvalidCredentialsError);
    });

    it('throws InvalidCredentialsError when password is wrong', async () => {
      userRepo.findByEmail.mockResolvedValue(makeUser());
      passwordService.compare.mockResolvedValue(false);

      await expect(
        authService.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(InvalidCredentialsError);
    });
  });

  describe('refresh', () => {
    it('returns a new access token when refresh token is valid', async () => {
      jwtService.verifyRefresh.mockReturnValue({
        sub: 'user_01',
        workspaceId: 'ws_01',
        role: Role.ADMIN,
        type: 'refresh',
      });

      const result = await authService.refresh('valid-refresh-token');
      expect(result.accessToken).toBe('acc2');
    });

    it('propagates InvalidTokenError when refresh token is invalid', async () => {
      jwtService.verifyRefresh.mockImplementation(() => { throw new InvalidTokenError(); });

      await expect(authService.refresh('bad-token')).rejects.toThrow(InvalidTokenError);
    });
  });

  describe('getMe', () => {
    it('returns user, workspace, and role when both are found', async () => {
      userRepo.findById.mockResolvedValue(makeUser());
      workspaceRepo.findMembership.mockResolvedValue(makeMembership());

      const result = await authService.getMe('user_01', 'ws_01');

      expect(result.user.id).toBe('user_01');
      expect(result.role).toBe(Role.ADMIN);
    });

    it('throws InvalidTokenError when user is not found', async () => {
      userRepo.findById.mockResolvedValue(null);

      await expect(authService.getMe('ghost', 'ws_01')).rejects.toThrow(InvalidTokenError);
    });

    it('throws InvalidTokenError when membership is not found', async () => {
      userRepo.findById.mockResolvedValue(makeUser());
      workspaceRepo.findMembership.mockResolvedValue(null);

      await expect(authService.getMe('user_01', 'ws_wrong')).rejects.toThrow(InvalidTokenError);
    });
  });
});
