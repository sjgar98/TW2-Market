import type { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import type { Repository } from 'typeorm';
import { AppModule } from './../src/app.module.js';
import { configureApp } from './../src/app.setup.js';
import { ItemCarrito } from './../src/entities/item-carrito.entity.js';
import { Producto } from './../src/entities/producto.entity.js';
import { Usuario } from './../src/entities/usuario.entity.js';

describe('Pedidos (e2e)', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;

  const datosProducto = {
    marca: 'Marca',
    descripcion: 'Descripción',
    clasificacion: 'Gama media',
    imagenUrl: 'https://placehold.co/600x600',
    pantalla: '6.5" IPS',
    almacenamientoGb: 128,
    ramGb: 8,
    bateriaMah: 5000,
    camara: '50MP',
  };

  async function crearUsuario(
    email: string,
  ): Promise<{ usuario: Usuario; token: string }> {
    const usuario = await app
      .get<Repository<Usuario>>(getRepositoryToken(Usuario))
      .save({
        email,
        passwordHash: 'hash',
        nombre: 'Ana',
        apellido: 'Gómez',
        direccion: 'Calle 1',
      });
    const token = await jwtService.signAsync({ sub: usuario.id });
    return { usuario, token };
  }

  async function crearProducto(
    nombre: string,
    precio: number,
    stock: number,
  ): Promise<Producto> {
    return app.get<Repository<Producto>>(getRepositoryToken(Producto)).save({
      ...datosProducto,
      nombre,
      precio,
      stock,
    });
  }

  async function agregarAlCarrito(
    usuario: Usuario,
    producto: Producto,
    cantidad: number,
  ): Promise<void> {
    await app
      .get<Repository<ItemCarrito>>(getRepositoryToken(ItemCarrito))
      .save({
        usuario,
        producto,
        cantidad,
      });
  }

  async function stockDe(producto: Producto): Promise<number> {
    const actual = await app
      .get<Repository<Producto>>(getRepositoryToken(Producto))
      .findOneByOrFail({
        id: producto.id,
      });
    return actual.stock;
  }

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = configureApp(moduleFixture.createNestApplication());
    await app.init();
    jwtService = app.get(JwtService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('rechaza confirmar un pedido sin token', () => {
    return request(app.getHttpServer()).post('/api/pedidos').expect(401);
  });

  it('confirma el pedido: descuenta stock, vacía el carrito y devuelve el pedido sin datos sensibles', async () => {
    const { usuario, token } = await crearUsuario('compradora@test.com');
    const celular = await crearProducto('Celular A', 100.1, 5);
    const funda = await crearProducto('Funda', 50, 3);
    await agregarAlCarrito(usuario, celular, 2);
    await agregarAlCarrito(usuario, funda, 1);

    const respuesta = await request(app.getHttpServer())
      .post('/api/pedidos')
      .auth(token, { type: 'bearer' })
      .expect(201);

    expect(respuesta.body).toMatchObject({
      direccionEnvio: 'Calle 1',
      total: 250.2,
      estadoPago: 'aprobado',
    });
    expect(respuesta.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          productoId: celular.id,
          nombre: 'Celular A',
          precioUnitario: 100.1,
          cantidad: 2,
          subtotal: 200.2,
        }),
        expect.objectContaining({
          productoId: funda.id,
          nombre: 'Funda',
          precioUnitario: 50,
          cantidad: 1,
          subtotal: 50,
        }),
      ]),
    );
    expect(respuesta.body).not.toHaveProperty('usuario');
    expect(JSON.stringify(respuesta.body)).not.toContain('hash');

    expect(await stockDe(celular)).toBe(3);
    expect(await stockDe(funda)).toBe(2);

    await request(app.getHttpServer())
      .get('/api/carrito')
      .auth(token, { type: 'bearer' })
      .expect(200)
      .expect((res) => expect(res.body.items).toEqual([]));
  });

  it('permite a la dueña consultar su pedido y oculta el pedido a otros usuarios', async () => {
    const dueña = await crearUsuario('dueña@test.com');
    const otra = await crearUsuario('otra@test.com');
    const producto = await crearProducto('Celular B', 80, 4);
    await agregarAlCarrito(dueña.usuario, producto, 1);
    const { body: pedido } = await request(app.getHttpServer())
      .post('/api/pedidos')
      .auth(dueña.token, { type: 'bearer' })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/api/pedidos/${pedido.id}`)
      .auth(dueña.token, { type: 'bearer' })
      .expect(200)
      .expect((res) => expect(res.body.id).toBe(pedido.id));

    await request(app.getHttpServer())
      .get(`/api/pedidos/${pedido.id}`)
      .auth(otra.token, { type: 'bearer' })
      .expect(404);
  });

  it('responde 409 con los productos afectados y no crea el pedido si falta stock', async () => {
    const { usuario, token } = await crearUsuario('sinstock@test.com');
    const disponible = await crearProducto('Disponible', 10, 10);
    const agotandose = await crearProducto('Agotándose', 20, 1);
    await agregarAlCarrito(usuario, disponible, 2);
    await agregarAlCarrito(usuario, agotandose, 2);

    const respuesta = await request(app.getHttpServer())
      .post('/api/pedidos')
      .auth(token, { type: 'bearer' })
      .expect(409);

    expect(respuesta.body.productos).toEqual([
      { productoId: agotandose.id, nombre: 'Agotándose', stockDisponible: 1 },
    ]);
    expect(await stockDe(disponible)).toBe(10);
    expect(await stockDe(agotandose)).toBe(1);

    await request(app.getHttpServer())
      .get('/api/carrito')
      .auth(token, { type: 'bearer' })
      .expect(200)
      .expect((res) => expect(res.body.items).toHaveLength(2));
  });

  it('rechaza confirmar con el carrito vacío', async () => {
    const { token } = await crearUsuario('vacio@test.com');

    await request(app.getHttpServer())
      .post('/api/pedidos')
      .auth(token, { type: 'bearer' })
      .expect(400);
  });

  it('valida el id del pedido', async () => {
    const { token } = await crearUsuario('id@test.com');

    await request(app.getHttpServer())
      .get('/api/pedidos/no-es-uuid')
      .auth(token, { type: 'bearer' })
      .expect(400);
  });
});
