import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { EnvironmentVariables } from '../../config/env.validation.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService<EnvironmentVariables, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET', { infer: true }),
    });
  }

  // El token ya fue verificado (firma y expiración). Lo devuelto queda en
  // `request.user`. El módulo de auth definirá el tipo del payload y, si hace
  // falta, verificará que el usuario siga existiendo.
  validate(payload: Record<string, unknown>): Record<string, unknown> {
    return payload;
  }
}
