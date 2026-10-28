import Joi from 'joi';
import type { ConfigModuleOptions } from '@nestjs/config';

export type EnvironmentVariables = {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  DB_PATH: string;
  DB_LOGGING: boolean;
  DB_SYNCHRONIZE: boolean;
  DB_MIGRATIONS_RUN: boolean;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
};

export const envValidationSchema = Joi.object<EnvironmentVariables, true>({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  // Archivo SQLite, relativo al directorio de trabajo (o ':memory:' para tests)
  DB_PATH: Joi.string().default('data/tw2market.sqlite'),
  DB_LOGGING: Joi.boolean().default(false),
  DB_SYNCHRONIZE: Joi.boolean().default(false),
  DB_MIGRATIONS_RUN: Joi.boolean().default(true),
  JWT_SECRET: Joi.string().min(32).required(),
  // Formato de `ms`: número de segundos o valor con unidad (e.g. '15m', '12h', '7d')
  JWT_EXPIRES_IN: Joi.string()
    .pattern(/^\d+\s?(ms|s|m|h|d|w|y)?$/)
    .default('12h'),
});

// Compartido por AppModule y el datasource del CLI de TypeORM, para que ambos
// validen y lean el entorno exactamente de la misma forma.
export const configModuleOptions: ConfigModuleOptions = {
  isGlobal: true,
  cache: true,
  validationSchema: envValidationSchema,
};
