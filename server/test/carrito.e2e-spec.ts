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

describe('Carrito (e2e)', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;

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

  async function crearProducto(stock: number): Promise<Producto> {
    return app.get<Repository<Producto>>(getRepositoryToken(Producto)).save({
      nombre: 'Celular',
      marca: 'Marca',
      descripcion: 'Descripción',
      precio: 100,
      stock,
      imagenUrl: 'https://placehold.co/600x600',
      pantalla: '6.5" IPS',
      almacenamientoGb: 128,
      ramGb: 8,
      bateriaMah: 5000,
      camara: '50MP',
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

  it('permite bajar la cantidad aunque el ítem supere el stock actual', async () => {
    const { usuario, token } = await crearUsuario('bajar@test.com');
    const producto = await crearProducto(3);
    await agregarAlCarrito(usuario, producto, 5);

    await request(app.getHttpServer())
      .patch(`/api/carrito/items/${producto.id}`)
      .auth(token, { type: 'bearer' })
      .send({ cantidad: 4 })
      .expect(200)
      .expect({ productoId: producto.id, cantidad: 4 });
  });

  it('rechaza subir la cantidad por encima del stock', async () => {
    const { usuario, token } = await crearUsuario('subir@test.com');
    const producto = await crearProducto(3);
    await agregarAlCarrito(usuario, producto, 1);

    await request(app.getHttpServer())
      .patch(`/api/carrito/items/${producto.id}`)
      .auth(token, { type: 'bearer' })
      .send({ cantidad: 4 })
      .expect(409);
  });
});
