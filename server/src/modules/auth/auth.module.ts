import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecuperacionPassword } from '../../entities/recuperacion-password.entity.js';
import { CorreoModule } from '../correo/correo.module.js';
import { UsuariosModule } from '../usuarios/usuarios.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RecuperacionPasswordRepository } from './recuperacion-password.repository.js';
import { RecuperacionPasswordService } from './recuperacion-password.service.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { LocalStrategy } from './strategies/local.strategy.js';

@Module({
  imports: [
    UsuariosModule,
    PassportModule,
    CorreoModule,
    TypeOrmModule.forFeature([RecuperacionPassword]),
  ],
  providers: [
    AuthService,
    RecuperacionPasswordService,
    RecuperacionPasswordRepository,
    LocalStrategy,
    JwtStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
