import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import type { EnvironmentVariables } from '../../config/env.validation.js';
import {
  CorreoService,
  type DatosCorreoRecuperacion,
} from '../correo/correo.service.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { RecuperacionPasswordRepository } from './recuperacion-password.repository.js';
import { RecuperacionPasswordService } from './recuperacion-password.service.js';
import { hashTokenRecuperacion } from './token-recuperacion.js';

const AHORA = new Date('2026-01-01T00:00:00.000Z');

const usuario = {
  id: 'usuario-1',
  email: 'ana@test.com',
  passwordHash: 'hash',
  nombre: 'Ana',
  apellido: 'Gómez',
  direccion: 'Calle 1',
  isAdmin: false,
};

describe('RecuperacionPasswordService', () => {
  let service: RecuperacionPasswordService;
  let usuariosService: { buscarPorEmail: ReturnType<typeof vi.fn> };
  let repository: {
    findByUsuarioId: ReturnType<typeof vi.fn>;
    reemplazar: ReturnType<typeof vi.fn>;
  };
  let correoService: { enviarRecuperacion: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(AHORA);

    usuariosService = { buscarPorEmail: vi.fn() };
    repository = { findByUsuarioId: vi.fn(), reemplazar: vi.fn() };
    correoService = { enviarRecuperacion: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecuperacionPasswordService,
        { provide: UsuariosService, useValue: usuariosService },
        { provide: RecuperacionPasswordRepository, useValue: repository },
        { provide: CorreoService, useValue: correoService },
        {
          provide: ConfigService<EnvironmentVariables, true>,
          useValue: {
            get: vi.fn().mockReturnValue('http://localhost:4200'),
          },
        },
      ],
    }).compile();

    service = module.get(RecuperacionPasswordService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('no genera ni envía nada cuando el email no está registrado', async () => {
    usuariosService.buscarPorEmail.mockResolvedValue(null);

    await service.solicitar('nadie@test.com');

    expect(repository.findByUsuarioId).not.toHaveBeenCalled();
    expect(repository.reemplazar).not.toHaveBeenCalled();
    expect(correoService.enviarRecuperacion).not.toHaveBeenCalled();
  });

  it('guarda el token hasheado y envía el enlace con el token original', async () => {
    usuariosService.buscarPorEmail.mockResolvedValue(usuario);
    repository.findByUsuarioId.mockResolvedValue(null);

    await service.solicitar('ana@test.com');

    expect(repository.reemplazar).toHaveBeenCalledTimes(1);
    const [usuarioId, tokenHash, creadoEn, expiraEn] = repository.reemplazar
      .mock.calls[0] as [string, string, Date, Date];
    expect(usuarioId).toBe(usuario.id);
    expect(creadoEn).toEqual(AHORA);
    expect(expiraEn).toEqual(new Date('2026-01-01T00:30:00.000Z'));
    expect(tokenHash).toHaveLength(64);

    expect(correoService.enviarRecuperacion).toHaveBeenCalledTimes(1);
    const datos = correoService.enviarRecuperacion.mock
      .calls[0][0] as DatosCorreoRecuperacion;
    expect(datos.destinatario).toBe(usuario.email);
    expect(datos.nombre).toBe(usuario.nombre);
    expect(datos.venceEnMinutos).toBe(30);

    const token = new URL(datos.enlace).searchParams.get('token');
    expect(token).toBeTruthy();
    expect(hashTokenRecuperacion(token ?? '')).toBe(tokenHash);
    expect(tokenHash).not.toBe(token);
  });

  it('no envía otro correo dentro del período de espera', async () => {
    usuariosService.buscarPorEmail.mockResolvedValue(usuario);
    repository.findByUsuarioId.mockResolvedValue({
      creadoEn: new Date('2025-12-31T23:59:30.000Z'),
      usadoEn: null,
    });

    await service.solicitar('ana@test.com');

    expect(repository.reemplazar).not.toHaveBeenCalled();
    expect(correoService.enviarRecuperacion).not.toHaveBeenCalled();
  });

  it('permite pedir un token nuevo cuando el anterior ya se usó', async () => {
    usuariosService.buscarPorEmail.mockResolvedValue(usuario);
    repository.findByUsuarioId.mockResolvedValue({
      creadoEn: new Date('2025-12-31T23:59:30.000Z'),
      usadoEn: new Date('2025-12-31T23:59:40.000Z'),
    });

    await service.solicitar('ana@test.com');

    expect(repository.reemplazar).toHaveBeenCalledTimes(1);
    expect(correoService.enviarRecuperacion).toHaveBeenCalledTimes(1);
  });
});
