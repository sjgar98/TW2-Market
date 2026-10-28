import { envValidationSchema } from './env.validation.js';

describe('envValidationSchema', () => {
  const requiredEnv = {
    JWT_SECRET: 'a'.repeat(32),
  };

  it('applies defaults and converts types', () => {
    const { error, value } = envValidationSchema.validate({
      ...requiredEnv,
      PORT: '8080',
      DB_LOGGING: 'true',
    });

    expect(error).toBeUndefined();
    expect(value).toMatchObject({
      NODE_ENV: 'development',
      PORT: 8080,
      DB_PATH: 'data/tw2market.sqlite',
      DB_LOGGING: true,
      DB_SYNCHRONIZE: false,
      DB_MIGRATIONS_RUN: true,
      JWT_EXPIRES_IN: '12h',
    });
  });

  it('rejects missing required variables', () => {
    const { error } = envValidationSchema.validate({}, { abortEarly: false });

    expect(error?.details.map((detail) => detail.context?.key)).toEqual([
      'JWT_SECRET',
    ]);
  });

  it('rejects a short JWT secret', () => {
    const { error } = envValidationSchema.validate({
      ...requiredEnv,
      JWT_SECRET: 'too-short',
    });

    expect(error?.message).toContain('JWT_SECRET');
  });

  it('rejects an invalid JWT expiration', () => {
    const { error } = envValidationSchema.validate({
      ...requiredEnv,
      JWT_EXPIRES_IN: 'tomorrow',
    });

    expect(error?.message).toContain('JWT_EXPIRES_IN');
  });
});
