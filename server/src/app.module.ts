import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, type JwtSignOptions } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { JwtStrategy } from './common/strategies/jwt.strategy.js';
import {
  configModuleOptions,
  type EnvironmentVariables,
} from './config/env.validation.js';
import { getDataSourceOptions } from './db/database.config.js';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>) =>
        getDataSourceOptions(config),
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>) => ({
        secret: config.get('JWT_SECRET', { infer: true }),
        signOptions: {
          expiresIn: config.get('JWT_EXPIRES_IN', {
            infer: true,
          }) as JwtSignOptions['expiresIn'],
        },
      }),
    }),
    // Sirve el build de Angular (copiado a /public por el Dockerfile). Las rutas
    // /api quedan excluidas para que un endpoint inexistente devuelva 404 y no index.html
    ServeStaticModule.forRoot({
      rootPath: join(import.meta.dirname, '..', 'public'),
      exclude: ['/api/{*splat}'],
    }),
  ],
  providers: [JwtStrategy, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
