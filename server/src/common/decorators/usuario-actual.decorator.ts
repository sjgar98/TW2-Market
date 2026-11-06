import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { UsuarioPublico } from '../../entities/usuario.entity.js';

export const UsuarioActual = createParamDecorator(
  (_data: unknown, context: ExecutionContext): UsuarioPublico =>
    context.switchToHttp().getRequest<Request>().user as UsuarioPublico,
);
