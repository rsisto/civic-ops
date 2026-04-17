import { PasswordService } from '../PasswordService';

describe('PasswordService', () => {
  jest.setTimeout(15000);

  let passwordService: PasswordService;

  beforeEach(() => {
    passwordService = new PasswordService();
  });

  it('hashes a password to a string different from the original', async () => {
    const hash = await passwordService.hash('my-password');
    expect(typeof hash).toBe('string');
    expect(hash).not.toBe('my-password');
  });

  it('returns true when comparing correct password against its hash', async () => {
    const hash = await passwordService.hash('correct-password');
    const result = await passwordService.compare('correct-password', hash);
    expect(result).toBe(true);
  });

  it('returns false when comparing wrong password against a hash', async () => {
    const hash = await passwordService.hash('correct-password');
    const result = await passwordService.compare('wrong-password', hash);
    expect(result).toBe(false);
  });
});
