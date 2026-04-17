import { User } from '../User';

describe('User entity', () => {
  const props = {
    id: 'user_01',
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: 'hashed_pw',
  };

  it('exposes id via getter', () => {
    const user = new User(props);
    expect(user.id).toBe('user_01');
  });

  it('exposes email via getter', () => {
    const user = new User(props);
    expect(user.email).toBe('test@example.com');
  });

  it('exposes name via getter', () => {
    const user = new User(props);
    expect(user.name).toBe('Test User');
  });

  it('exposes passwordHash via getter', () => {
    const user = new User(props);
    expect(user.passwordHash).toBe('hashed_pw');
  });

  it('allows id to be undefined for new (unsaved) users', () => {
    const user = new User({ email: 'a@b.com', name: 'A', passwordHash: 'h' });
    expect(user.id).toBeUndefined();
  });
});
