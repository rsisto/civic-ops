/** @type {import('eslint').Linter.Config} */
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.eslint.json',
    tsconfigRootDir: __dirname,
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  rules: {
    // Enforce explicit return types on exported functions
    '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
    // Disallow any
    '@typescript-eslint/no-explicit-any': 'error',
    // Disallow non-null assertions
    '@typescript-eslint/no-non-null-assertion': 'error',
    // No unused vars
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    // Require await in async functions
    '@typescript-eslint/require-await': 'error',
    // No floating promises
    '@typescript-eslint/no-floating-promises': 'error',
    // No console.log in production code
    'no-console': 'error',
  },
  env: {
    node: true,
    es2022: true,
  },
  ignorePatterns: ['dist/', 'node_modules/', 'jest.config.ts'],
};
