import type { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import type { Repository } from 'typeorm';
import { AppModule } from './../src/app.module.js';
import { configureApp } from './../src/app.setup.js';
import { RecuperacionPassword } from './../src/entities/recuperacion-password.entity.js';
import { Usuario } from './../src/entities/usuario.entity.js';
import { hashTokenRecuperacion } from './../src/modules/auth/token-recuperacion.js';
import {
  CorreoService,
  type DatosCorreoRecuperacion,
} from './../src/modules/correo/correo.service.js';

describe('Recuperación de contraseña (e2e)', () => {
  let app: INestApplication<App>;
  let enviarRecuperacion: ReturnType<typeof vi.fn>;

  async function crearUsuario(email = 'ana@test.com'): Promise<Usuario> {
    return app.get<Repository<Usuario>>(getRepositoryToken(Usuario)).save({
      email,
      passwordHash: 'hash',
      nombre: 'Ana',
      apellido: 'Gómez',
      direccion: 'Calle 1',
    });
  }

  beforeEach(async () => {
    enviarRecuperacion = vi.fn(
      async (_datos: DatosCorreoRecuperacion): Promise<void> => undefined,
    );

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CorreoService)
      .useValue({ enviarRecuperacion })
      .compile();

    app = configureApp(moduleFixture.createNestApplication());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('responde 202 y guarda el token hasheado aunque el email esté en mayúsculas', async () => {
    const usuario = await crearUsuario();

    const respuesta = await request(app.getHttpServer())
      .post('/api/auth/recuperar-password')
      .send({ email: ' ANA@TEST.COM ' })
      .expect(202);

    expect(respuesta.body).toEqual({
      message: expect.stringContaining('Si el email está registrado'),
    });
    expect(enviarRecuperacion).toHaveBeenCalledTimes(1);

    const datos = enviarRecuperacion.mock
      .calls[0][0] as DatosCorreoRecuperacion;
    expect(datos.destinatario).toBe('ana@test.com');
    const token = new URL(datos.enlace).searchParams.get('token');
    expect(token).toBeTruthy();

    const recuperacion = await app
      .get<Repository<RecuperacionPassword>>(
        getRepositoryToken(RecuperacionPassword),
      )
      .findOne({ where: { usuario: { id: usuario.id } } });
    expect(recuperacion).not.toBeNull();
    expect(recuperacion?.tokenHash).toBe(hashTokenRecuperacion(token ?? ''));
    expect(recuperacion?.tokenHash).not.toBe(token);
    expect(recuperacion?.expiraEn.getTime()).toBeGreaterThan(Date.now());
  });

  it('responde 202 y no envía nada cuando el email no está registrado', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/recuperar-password')
      .send({ email: 'nadie@test.com' })
      .expect(202);

    expect(enviarRecuperacion).not.toHaveBeenCalled();
    expect(
      await app
        .get<Repository<RecuperacionPassword>>(
          getRepositoryToken(RecuperacionPassword),
        )
        .count(),
    ).toBe(0);
  });

  it('no vuelve a enviar el correo dentro del período de espera', async () => {
    await crearUsuario();

    await request(app.getHttpServer())
      .post('/api/auth/recuperar-password')
      .send({ email: 'ana@test.com' })
      .expect(202);
    await request(app.getHttpServer())
      .post('/api/auth/recuperar-password')
      .send({ email: 'ana@test.com' })
      .expect(202);

    expect(enviarRecuperacion).toHaveBeenCalledTimes(1);
  });

  it('reemplaza el token anterior cuando se pide uno nuevo fuera del período de espera', async () => {
    const usuario = await crearUsuario();
    const repositorio = app.get<Repository<RecuperacionPassword>>(
      getRepositoryToken(RecuperacionPassword),
    );

    await request(app.getHttpServer())
      .post('/api/auth/recuperar-password')
      .send({ email: 'ana@test.com' })
      .expect(202);
    const primero = await repositorio.findOneOrFail({
      where: { usuario: { id: usuario.id } },
    });

    await repositorio.update(primero.id, {
      creadoEn: new Date(Date.now() - 120_000),
    });

    await request(app.getHttpServer())
      .post('/api/auth/recuperar-password')
      .send({ email: 'ana@test.com' })
      .expect(202);

    expect(enviarRecuperacion).toHaveBeenCalledTimes(2);
    expect(await repositorio.count()).toBe(1);
    const segundo = await repositorio.findOneOrFail({
      where: { usuario: { id: usuario.id } },
    });
    expect(segundo.id).toBe(primero.id);
    expect(segundo.tokenHash).not.toBe(primero.tokenHash);
  });

  it('rechaza un email inválido sin consultar la base', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/recuperar-password')
      .send({ email: 'no-es-un-email' })
      .expect(400);

    expect(enviarRecuperacion).not.toHaveBeenCalled();
  });
});
