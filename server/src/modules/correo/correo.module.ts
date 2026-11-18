import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  CORREO_CONFIG,
  CorreoService,
  crearCorreoConfig,
} from './correo.service.js';

@Module({
  imports: [ConfigModule],
  providers: [
    CorreoService,
    {
      provide: CORREO_CONFIG,
      inject: [ConfigService],
      useFactory: crearCorreoConfig,
    },
  ],
  exports: [CorreoService],
})
export class CorreoModule {}
