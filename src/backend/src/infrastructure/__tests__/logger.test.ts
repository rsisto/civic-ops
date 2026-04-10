import { logger } from '../logger';

describe('logger', () => {
  it('exports an object with info, error, warn, and debug methods', () => {
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  it('does not throw when logging at each level', () => {
    expect(() => logger.info('test info message')).not.toThrow();
    expect(() => logger.warn('test warn message')).not.toThrow();
    expect(() => logger.error('test error message')).not.toThrow();
    expect(() => logger.debug('test debug message')).not.toThrow();
  });

  it('accepts a context object as the first argument', () => {
    expect(() =>
      logger.info({ userId: 'u_123', workspaceId: 'w_456' }, 'action with context'),
    ).not.toThrow();
  });
});
