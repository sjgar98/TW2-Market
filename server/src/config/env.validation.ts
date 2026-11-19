import Joi from 'joi';
import type { ConfigModuleOptions } from '@nestjs/config';

export type EnvironmentVariables = {
  PORT: number;
  DB_PATH: string;
  DB_LOGGING: boolean;
  DB_SYNCHRONIZE: boolean;
  DB_MIGRATIONS_RUN: boolean;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  APP_URL: string;
  SMTP_HOST?: string;
  SMTP_PORT: number;
  SMTP_SECURE: boolean;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  CORREO_REMITENTE: string;
};

export const envValidationSchema = Joi.object<EnvironmentVariables, true>({
  PORT: Joi.number().port().default(3000),
  DB_PATH: Joi.string().default('data/tw2market.sqlite'),
  DB_LOGGING: Joi.boolean().default(false),
  DB_SYNCHRONIZE: Joi.boolean().default(false),
  DB_MIGRATIONS_RUN: Joi.boolean().default(true),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string()
    .pattern(/^\d+\s?(ms|s|m|h|d|w|y)?$/)
    .default('12h'),
  APP_URL: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .default('http://localhost:4200'),
  SMTP_HOST: Joi.string().allow('').optional(),
  SMTP_PORT: Joi.number().port().default(587),
  SMTP_SECURE: Joi.boolean().default(false),
  SMTP_USER: Joi.string().allow('').optional(),
  SMTP_PASS: Joi.string().allow('').optional(),
  CORREO_REMITENTE: Joi.string().default('no-responder@tw2market.local'),
});

export const configModuleOptions: ConfigModuleOptions = {
  isGlobal: true,
  cache: true,
  validationSchema: envValidationSchema,
};
