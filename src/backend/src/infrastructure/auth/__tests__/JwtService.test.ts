import { JwtService } from '../JwtService';
import { InvalidTokenError } from '../../../domain/identity/errors';
import { Role } from '../../../domain/identity/Role';

const TEST_PAYLOAD = {
  userId: 'user_01',
  workspaceId: 'ws_01',
  role: Role.ADMIN,
};

beforeAll(() => {
  process.env['JWT_ACCESS_SECRET'] = 'test-access-secret-32-chars-minimum!!';
  process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-32-chars-minimum!';
  process.env['JWT_ACCESS_EXPIRES_IN'] = '15m';
  process.env['JWT_REFRESH_EXPIRES_IN'] = '7d';
});

describe('JwtService', () => {
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = new JwtService();
  });

  describe('signPair', () => {
    it('returns both accessToken and refreshToken', () => {
      const tokens = jwtService.signPair(TEST_PAYLOAD);
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
      expect(tokens.accessToken).not.toBe(tokens.refreshToken);
    });
  });

  describe('verifyAccess', () => {
    it('returns the payload when the access token is valid', () => {
      const { accessToken } = jwtService.signPair(TEST_PAYLOAD);
      const payload = jwtService.verifyAccess(accessToken);
      expect(payload.sub).toBe('user_01');
      expect(payload.workspaceId).toBe('ws_01');
      expect(payload.role).toBe(Role.ADMIN);
      expect(payload.type).toBe('access');
    });

    it('throws InvalidTokenError when a refresh token is used as access', () => {
      const { refreshToken } = jwtService.signPair(TEST_PAYLOAD);
      expect(() => jwtService.verifyAccess(refreshToken)).toThrow(InvalidTokenError);
    });

    it('throws InvalidTokenError for a malformed token', () => {
      expect(() => jwtService.verifyAccess('not.a.token')).toThrow(InvalidTokenError);
    });
  });

  describe('verifyRefresh', () => {
    it('returns the payload when the refresh token is valid', () => {
      const { refreshToken } = jwtService.signPair(TEST_PAYLOAD);
      const payload = jwtService.verifyRefresh(refreshToken);
      expect(payload.sub).toBe('user_01');
      expect(payload.type).toBe('refresh');
    });

    it('throws InvalidTokenError when an access token is used as refresh', () => {
      const { accessToken } = jwtService.signPair(TEST_PAYLOAD);
      expect(() => jwtService.verifyRefresh(accessToken)).toThrow(InvalidTokenError);
    });

    it('throws InvalidTokenError for a malformed token', () => {
      expect(() => jwtService.verifyRefresh('bad')).toThrow(InvalidTokenError);
    });
  });
});
