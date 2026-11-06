import { NestFactory } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import {
  configModuleOptions,
  type EnvironmentVariables,
} from '../config/env.validation.js';
import { getDataSourceOptions } from './database.config.js';

const context = await NestFactory.createApplicationContext(
  ConfigModule.forRoot({ ...configModuleOptions, isGlobal: false }),
  { logger: ['error'] },
);
const config =
  context.get<ConfigService<EnvironmentVariables, true>>(ConfigService);
const dataSource = new DataSource({
  ...getDataSourceOptions(config),
  migrationsRun: false,
});
await context.close();

export default dataSource;
