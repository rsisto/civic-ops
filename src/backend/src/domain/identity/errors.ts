export class EmailAlreadyExistsError extends Error {
  readonly statusCode = 409;
  readonly code = 'EMAIL_EXISTS';

  constructor() {
    super('Email already registered');
    this.name = 'EmailAlreadyExistsError';
  }
}

export class InvalidCredentialsError extends Error {
  readonly statusCode = 401;
  readonly code = 'INVALID_CREDENTIALS';

  constructor() {
    super('Invalid credentials');
    this.name = 'InvalidCredentialsError';
  }
}

export class InvalidTokenError extends Error {
  readonly statusCode = 401;
  readonly code = 'INVALID_TOKEN';

  constructor() {
    super('Invalid or expired token');
    this.name = 'InvalidTokenError';
  }
}

export class UnauthorizedError extends Error {
  readonly statusCode = 401;
  readonly code = 'UNAUTHORIZED';

  constructor() {
    super('Unauthorized');
    this.name = 'UnauthorizedError';
  }
}
