import type { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { hash } from 'bcrypt';
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

  async function crearUsuario(
    email = 'ana@test.com',
    password = 'ViejaPassword1!',
  ): Promise<Usuario> {
    return app.get<Repository<Usuario>>(getRepositoryToken(Usuario)).save({
      email,
      passwordHash: await hash(password, 4),
      nombre: 'Ana',
      apellido: 'Gómez',
      direccion: 'Calle 1',
    });
  }

  async function solicitarToken(email: string): Promise<string> {
    await request(app.getHttpServer())
      .post('/api/auth/recuperar-password')
      .send({ email })
      .expect(202);

    const datos = enviarRecuperacion.mock.calls.at(-1)?.[0] as
      DatosCorreoRecuperacion | undefined;
    const token = datos
      ? new URL(datos.enlace).searchParams.get('token')
      : null;
    if (!token) throw new Error('No se capturó el token de recuperación');
    return token;
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
    const primerToken = new URL(
      (enviarRecuperacion.mock.calls[0][0] as DatosCorreoRecuperacion).enlace,
    ).searchParams.get('token');
    expect(primerToken).toBeTruthy();
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

    await request(app.getHttpServer())
      .post('/api/auth/restablecer-password')
      .send({
        token: primerToken ?? '',
        password: 'NuevaPassword1!',
        repeatPassword: 'NuevaPassword1!',
      })
      .expect(400);
  });

  it('rechaza un email inválido sin consultar la base', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/recuperar-password')
      .send({ email: 'no-es-un-email' })
      .expect(400);

    expect(enviarRecuperacion).not.toHaveBeenCalled();
  });

  it('actualiza la contraseña, consume el token y permite ingresar con la nueva', async () => {
    const usuario = await crearUsuario('restablecer@test.com');
    const token = await solicitarToken('restablecer@test.com');

    const respuesta = await request(app.getHttpServer())
      .post('/api/auth/restablecer-password')
      .send({
        token,
        password: 'NuevaPassword1!',
        repeatPassword: 'NuevaPassword1!',
      })
      .expect(200);
    expect(respuesta.body).toEqual({
      message: expect.stringContaining('actualizada'),
    });

    await request(app.getHttpServer())
      .post('/api/auth/signin')
      .send({ email: 'restablecer@test.com', password: 'NuevaPassword1!' })
      .expect(200);
    await request(app.getHttpServer())
      .post('/api/auth/signin')
      .send({ email: 'restablecer@test.com', password: 'ViejaPassword1!' })
      .expect(401);

    await request(app.getHttpServer())
      .post('/api/auth/restablecer-password')
      .send({
        token,
        password: 'OtraPassword1!',
        repeatPassword: 'OtraPassword1!',
      })
      .expect(400);

    const recuperacion = await app
      .get<Repository<RecuperacionPassword>>(
        getRepositoryToken(RecuperacionPassword),
      )
      .findOneOrFail({ where: { usuario: { id: usuario.id } } });
    expect(recuperacion.usadoEn).not.toBeNull();
  }, 30_000);

  it('rechaza un token vencido sin cambiar la contraseña', async () => {
    const usuario = await crearUsuario('vencido@test.com');
    const token = await solicitarToken('vencido@test.com');
    const repositorio = app.get<Repository<RecuperacionPassword>>(
      getRepositoryToken(RecuperacionPassword),
    );
    const recuperacion = await repositorio.findOneOrFail({
      where: { usuario: { id: usuario.id } },
    });

    await repositorio.update(recuperacion.id, {
      expiraEn: new Date(Date.now() - 60_000),
    });

    await request(app.getHttpServer())
      .post('/api/auth/restablecer-password')
      .send({
        token,
        password: 'NuevaPassword1!',
        repeatPassword: 'NuevaPassword1!',
      })
      .expect(400);
  });

  it('rechaza un token inexistente', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/restablecer-password')
      .send({
        token: 'token-que-no-existe',
        password: 'NuevaPassword1!',
        repeatPassword: 'NuevaPassword1!',
      })
      .expect(400);
  });

  it('no consume el token si la contraseña no cumple la política', async () => {
    const usuario = await crearUsuario('debil@test.com');
    const token = await solicitarToken('debil@test.com');

    await request(app.getHttpServer())
      .post('/api/auth/restablecer-password')
      .send({ token, password: 'corta', repeatPassword: 'corta' })
      .expect(400);

    const recuperacion = await app
      .get<Repository<RecuperacionPassword>>(
        getRepositoryToken(RecuperacionPassword),
      )
      .findOneOrFail({ where: { usuario: { id: usuario.id } } });
    expect(recuperacion.usadoEn).toBeNull();
  });

  it('rechaza contraseñas que no coinciden sin consumir el token', async () => {
    const usuario = await crearUsuario('distintas@test.com');
    const token = await solicitarToken('distintas@test.com');

    await request(app.getHttpServer())
      .post('/api/auth/restablecer-password')
      .send({
        token,
        password: 'NuevaPassword1!',
        repeatPassword: 'OtraPassword1!',
      })
      .expect(400);

    const recuperacion = await app
      .get<Repository<RecuperacionPassword>>(
        getRepositoryToken(RecuperacionPassword),
      )
      .findOneOrFail({ where: { usuario: { id: usuario.id } } });
    expect(recuperacion.usadoEn).toBeNull();
  });
});
