import { mkdir, mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import nodemailer from 'nodemailer';
import { CorreoService, type CorreoConfig } from './correo.service.js';

describe('CorreoService', () => {
  let directorioBuzon: string;

  beforeEach(async () => {
    const base = join(process.cwd(), 'data');
    await mkdir(base, { recursive: true });
    directorioBuzon = await mkdtemp(join(base, 'buzon-test-'));
  });

  afterEach(async () => {
    await rm(directorioBuzon, { recursive: true, force: true });
  });

  it('guarda el correo en el buzón de desarrollo cuando no hay SMTP', async () => {
    const config: CorreoConfig = {
      transporter: nodemailer.createTransport({
        streamTransport: true,
        buffer: true,
        newline: 'unix',
      }),
      modo: 'archivo',
      remitente: 'no-responder@tw2market.local',
      directorioBuzon,
    };
    const service = new CorreoService(config);

    await service.enviarRecuperacion({
      destinatario: 'ana@test.com',
      nombre: 'Ana',
      enlace: 'http://localhost:4200/restablecer-password?token=abc123',
      venceEnMinutos: 30,
    });

    const archivos = await readdir(directorioBuzon);
    expect(archivos).toHaveLength(1);
    expect(archivos[0]).toMatch(/\.eml$/);

    const contenido = await readFile(
      join(directorioBuzon, archivos[0]),
      'utf8',
    );
    expect(contenido).toContain('To: ana@test.com');
    expect(contenido).toContain('restablecer-password');
    expect(contenido).toContain('abc123');
    expect(contenido).toContain('Subject:');
  });
});
