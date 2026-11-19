import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';
import type { SentMessageInfo, Transporter } from 'nodemailer';
import type { ConfigService } from '@nestjs/config';
import type { EnvironmentVariables } from '../../config/env.validation.js';

export const CORREO_CONFIG = Symbol('CORREO_CONFIG');

export type DatosCorreoRecuperacion = {
  destinatario: string;
  nombre: string;
  enlace: string;
  venceEnMinutos: number;
};

export type CorreoConfig = {
  transporter: Transporter;
  modo: 'smtp' | 'archivo';
  remitente: string;
  directorioBuzon: string;
};

export function crearCorreoConfig(
  config: ConfigService<EnvironmentVariables, true>,
): CorreoConfig {
  const remitente = config.get('CORREO_REMITENTE', { infer: true });
  const directorioBuzon = join(process.cwd(), 'data', 'buzon');
  const host = config.get('SMTP_HOST', { infer: true })?.trim();

  if (!host) {
    return {
      transporter: nodemailer.createTransport({
        streamTransport: true,
        buffer: true,
        newline: 'unix',
      }),
      modo: 'archivo',
      remitente,
      directorioBuzon,
    };
  }

  const usuario = config.get('SMTP_USER', { infer: true })?.trim();
  const password = config.get('SMTP_PASS', { infer: true });

  return {
    transporter: nodemailer.createTransport({
      host,
      port: config.get('SMTP_PORT', { infer: true }),
      secure: config.get('SMTP_SECURE', { infer: true }),
      auth: usuario ? { user: usuario, pass: password ?? '' } : undefined,
    }),
    modo: 'smtp',
    remitente,
    directorioBuzon,
  };
}

@Injectable()
export class CorreoService {
  private readonly logger = new Logger(CorreoService.name);

  constructor(@Inject(CORREO_CONFIG) private readonly config: CorreoConfig) {
    if (this.config.modo === 'archivo') {
      this.logger.warn(
        `SMTP no configurado: los correos se guardan en ${this.config.directorioBuzon}`,
      );
    }
  }

  async enviarRecuperacion(datos: DatosCorreoRecuperacion): Promise<void> {
    const info = await this.config.transporter.sendMail({
      from: `"TW2 Market" <${this.config.remitente}>`,
      to: datos.destinatario,
      subject: 'Restablecé tu contraseña de TW2 Market',
      text: textoRecuperacion(datos),
      html: htmlRecuperacion(datos),
    });

    if (this.config.modo === 'archivo') {
      await this.guardarEnBuzon(info);
    }
  }

  private async guardarEnBuzon(info: SentMessageInfo): Promise<void> {
    const mensaje = (info as { message?: Buffer }).message;
    if (!mensaje) {
      throw new Error('El transporte de correo no devolvió el mensaje');
    }
    await mkdir(this.config.directorioBuzon, { recursive: true });
    const archivo = join(
      this.config.directorioBuzon,
      `${Date.now()}-${randomUUID()}.eml`,
    );
    await writeFile(archivo, mensaje);
    this.logger.log(`Correo guardado en ${archivo}`);
  }
}

function textoRecuperacion(datos: DatosCorreoRecuperacion): string {
  return [
    `Hola ${datos.nombre}:`,
    '',
    'Pediste restablecer tu contraseña de TW2 Market.',
    `Abrí este enlace para elegir una nueva (vence en ${datos.venceEnMinutos} minutos y se puede usar una sola vez):`,
    datos.enlace,
    '',
    'Si no pediste el cambio, ignorá este correo.',
  ].join('\n');
}

function htmlRecuperacion(datos: DatosCorreoRecuperacion): string {
  return `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:24px;background:#f5f5f5;font-family:Arial,sans-serif;color:#1f1f1f">
    <div style="max-width:520px;margin:0 auto;padding:24px;background:#ffffff;border-radius:8px">
      <h1 style="margin:0 0 16px;font-size:20px">Restablecé tu contraseña</h1>
      <p style="margin:0 0 12px">Hola ${escaparHtml(datos.nombre)}:</p>
      <p style="margin:0 0 12px">Pediste restablecer tu contraseña de TW2 Market.</p>
      <p style="margin:0 0 20px">El enlace vence en ${datos.venceEnMinutos} minutos y se puede usar una sola vez.</p>
      <p style="margin:0 0 20px">
        <a href="${escaparHtml(datos.enlace)}" style="display:inline-block;padding:12px 20px;border-radius:4px;background:#6750a4;color:#ffffff;text-decoration:none">Elegir nueva contraseña</a>
      </p>
      <p style="margin:0;color:#5f5f5f;font-size:14px">Si no pediste el cambio, ignorá este correo.</p>
    </div>
  </body>
</html>`;
}

function escaparHtml(valor: string): string {
  const reemplazos: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return valor.replace(
    /[&<>"']/g,
    (caracter) => reemplazos[caracter] ?? caracter,
  );
}
