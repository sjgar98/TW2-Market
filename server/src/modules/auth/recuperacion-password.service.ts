import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvironmentVariables } from '../../config/env.validation.js';
import { CorreoService } from '../correo/correo.service.js';
import { hashearPassword } from '../usuarios/password.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import type { RestablecerPasswordDto } from './auth.dto.js';
import { RecuperacionPasswordRepository } from './recuperacion-password.repository.js';
import {
  generarTokenRecuperacion,
  hashTokenRecuperacion,
} from './token-recuperacion.js';

export const MENSAJE_SOLICITUD_RECUPERACION =
  'Si el email está registrado, te enviamos un enlace para restablecer la contraseña.';
export const MENSAJE_TOKEN_RECUPERACION_INVALIDO =
  'El enlace no es válido o venció. Pedí uno nuevo.';
export const MENSAJE_PASSWORD_ACTUALIZADA =
  'Tu contraseña fue actualizada. Ya podés ingresar.';

const VENCIMIENTO_MINUTOS = 30;
const ESPERA_ENTRE_SOLICITUDES_SEGUNDOS = 60;

@Injectable()
export class RecuperacionPasswordService {
  private readonly logger = new Logger(RecuperacionPasswordService.name);

  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly recuperacionRepository: RecuperacionPasswordRepository,
    private readonly correoService: CorreoService,
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  async solicitar(email: string): Promise<void> {
    const usuario = await this.usuariosService.buscarPorEmail(email);
    if (!usuario) return;

    const ahora = new Date();
    const recuperacion = await this.recuperacionRepository.findByUsuarioId(
      usuario.id,
    );

    if (this.dentroDelCooldown(recuperacion, ahora)) return;

    const token = generarTokenRecuperacion();
    const expiraEn = new Date(
      ahora.getTime() + VENCIMIENTO_MINUTOS * 60 * 1000,
    );
    await this.recuperacionRepository.reemplazar(
      usuario.id,
      hashTokenRecuperacion(token),
      ahora,
      expiraEn,
    );

    try {
      await this.correoService.enviarRecuperacion({
        destinatario: usuario.email,
        nombre: usuario.nombre,
        enlace: this.armarEnlace(token),
        venceEnMinutos: VENCIMIENTO_MINUTOS,
      });
    } catch (error) {
      this.logger.error(
        'No se pudo enviar el correo de recuperación',
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  async restablecer(dto: RestablecerPasswordDto): Promise<void> {
    const recuperacion = await this.recuperacionRepository.findByTokenHash(
      hashTokenRecuperacion(dto.token),
    );
    const ahora = new Date();

    if (
      !recuperacion ||
      recuperacion.usadoEn !== null ||
      recuperacion.expiraEn.getTime() <= ahora.getTime()
    ) {
      throw new BadRequestException(MENSAJE_TOKEN_RECUPERACION_INVALIDO);
    }

    const passwordHash = await hashearPassword(dto.password);
    const consumido =
      await this.recuperacionRepository.consumirTokenYActualizarPassword({
        recuperacionId: recuperacion.id,
        usuarioId: recuperacion.usuario.id,
        passwordHash,
        usadoEn: ahora,
      });

    if (!consumido) {
      throw new BadRequestException(MENSAJE_TOKEN_RECUPERACION_INVALIDO);
    }
  }

  private dentroDelCooldown(
    recuperacion: { creadoEn: Date; usadoEn: Date | null } | null,
    ahora: Date,
  ): boolean {
    return (
      recuperacion !== null &&
      recuperacion.usadoEn === null &&
      ahora.getTime() - recuperacion.creadoEn.getTime() <
        ESPERA_ENTRE_SOLICITUDES_SEGUNDOS * 1000
    );
  }

  private armarEnlace(token: string): string {
    const enlace = new URL(
      '/restablecer-password',
      this.config.get('APP_URL', { infer: true }),
    );
    enlace.searchParams.set('token', token);
    return enlace.toString();
  }
}
