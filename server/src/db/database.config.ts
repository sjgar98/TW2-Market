import { join } from 'node:path';
import type { ConfigService } from '@nestjs/config';
import type { DataSourceOptions } from 'typeorm';
import type { EnvironmentVariables } from '../config/env.validation.js';

export function getDataSourceOptions(
  config: ConfigService<EnvironmentVariables, true>,
): DataSourceOptions {
  return {
    type: 'better-sqlite3',
    database: config.get('DB_PATH', { infer: true }),
    logging: config.get('DB_LOGGING', { infer: true }),
    synchronize: config.get('DB_SYNCHRONIZE', { infer: true }),
    migrationsRun: config.get('DB_MIGRATIONS_RUN', { infer: true }),
    // Rutas relativas al código compilado (dist/), no al directorio de trabajo
    entities: [join(import.meta.dirname, '..', '**', '*.entity.js')],
    migrations: [join(import.meta.dirname, 'migrations', '*.js')],
    migrationsTableName: 'migrations',
  };
}
