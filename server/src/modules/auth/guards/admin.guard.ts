import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import type { Request } from 'express';
import type { UsuarioPublico } from '../../../entities/usuario.entity.js';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const usuario = context.switchToHttp().getRequest<Request>().user as
      UsuarioPublico | undefined;
    return usuario?.isAdmin === true;
  }
}
