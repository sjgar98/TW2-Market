import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import type { ItemCarrito } from '../../entities/item-carrito.entity.js';
import type { Pedido } from '../../entities/pedido.entity.js';
import type { UsuarioPublico } from '../../entities/usuario.entity.js';
import {
  PedidosRepository,
  type TransaccionPedidos,
} from './pedidos.repository.js';
import { PedidosService } from './pedidos.service.js';

const usuario: UsuarioPublico = {
  id: 'usuario-1',
  email: 'ana@test.com',
  nombre: 'Ana',
  apellido: 'Gómez',
  direccion: 'Calle Falsa 123',
  isAdmin: false,
};

function crearItemCarrito(
  productoId: string,
  cantidad: number,
  precio: number,
  stock: number,
): ItemCarrito {
  return {
    id: `item-${productoId}`,
    cantidad,
    producto: {
      id: productoId,
      nombre: `Producto ${productoId}`,
      precio,
      stock,
    },
  } as ItemCarrito;
}

function crearTransaccionMock(items: ItemCarrito[]) {
  return {
    findItemsDelCarrito: vi.fn().mockResolvedValue(items),
    descontarStock: vi.fn().mockResolvedValue(true),
    guardarPedido: vi.fn().mockResolvedValue({ id: 'pedido-1' }),
    vaciarCarrito: vi.fn().mockResolvedValue(undefined),
  };
}

describe('PedidosService', () => {
  let service: PedidosService;
  let repository: {
    transaccion: ReturnType<typeof vi.fn>;
    findByIdYUsuarioId: ReturnType<typeof vi.fn>;
  };

  async function montarServicio(
    tx: ReturnType<typeof crearTransaccionMock>,
  ): Promise<void> {
    repository = {
      transaccion: vi.fn(
        (trabajo: (t: TransaccionPedidos) => Promise<unknown>) =>
          trabajo(tx as unknown as TransaccionPedidos),
      ),
      findByIdYUsuarioId: vi.fn(),
    };
    const modulo: TestingModule = await Test.createTestingModule({
      providers: [
        PedidosService,
        { provide: PedidosRepository, useValue: repository },
      ],
    }).compile();
    service = modulo.get(PedidosService);
  }

  describe('confirmar', () => {
    it('rechaza confirmar con el carrito vacío', async () => {
      const tx = crearTransaccionMock([]);
      await montarServicio(tx);

      await expect(service.confirmar(usuario)).rejects.toThrow(
        BadRequestException,
      );
      expect(tx.guardarPedido).not.toHaveBeenCalled();
    });

    it('no descuenta stock ni crea el pedido si algún ítem supera el stock', async () => {
      const tx = crearTransaccionMock([
        crearItemCarrito('p1', 2, 100, 5),
        crearItemCarrito('p2', 3, 50, 1),
      ]);
      await montarServicio(tx);

      const resultado = service.confirmar(usuario);

      await expect(resultado).rejects.toThrow(ConflictException);
      await expect(resultado).rejects.toMatchObject({
        response: {
          productos: [
            { productoId: 'p2', nombre: 'Producto p2', stockDisponible: 1 },
          ],
        },
      });
      expect(tx.descontarStock).not.toHaveBeenCalled();
      expect(tx.guardarPedido).not.toHaveBeenCalled();
      expect(tx.vaciarCarrito).not.toHaveBeenCalled();
    });

    it('cancela el pedido si el descuento de stock falla por una compra concurrente', async () => {
      const tx = crearTransaccionMock([crearItemCarrito('p1', 2, 100, 5)]);
      tx.descontarStock.mockResolvedValue(false);
      await montarServicio(tx);

      await expect(service.confirmar(usuario)).rejects.toThrow(
        ConflictException,
      );
      expect(tx.guardarPedido).not.toHaveBeenCalled();
      expect(tx.vaciarCarrito).not.toHaveBeenCalled();
    });

    it('descuenta el stock, guarda el pedido con precios actuales, vacía el carrito y devuelve el pedido', async () => {
      const tx = crearTransaccionMock([
        crearItemCarrito('p1', 2, 100.1, 5),
        crearItemCarrito('p2', 1, 50, 3),
      ]);
      await montarServicio(tx);
      const pedidoGuardado = {
        id: 'pedido-1',
        creadoEn: new Date('2026-11-13T12:00:00.000Z'),
        direccionEnvio: usuario.direccion,
        total: 250.2,
        items: [],
      } as unknown as Pedido;
      repository.findByIdYUsuarioId.mockResolvedValue(pedidoGuardado);

      const pedido = await service.confirmar(usuario);

      expect(tx.descontarStock).toHaveBeenNthCalledWith(1, 'p1', 2);
      expect(tx.descontarStock).toHaveBeenNthCalledWith(2, 'p2', 1);
      expect(tx.guardarPedido).toHaveBeenCalledWith({
        usuario: { id: usuario.id },
        direccionEnvio: usuario.direccion,
        total: 250.2,
        items: [
          { producto: { id: 'p1' }, cantidad: 2, precioUnitario: 100.1 },
          { producto: { id: 'p2' }, cantidad: 1, precioUnitario: 50 },
        ],
      });
      expect(tx.vaciarCarrito).toHaveBeenCalledWith(usuario.id);
      expect(repository.findByIdYUsuarioId).toHaveBeenCalledWith(
        'pedido-1',
        usuario.id,
      );
      expect(pedido).toMatchObject({
        id: 'pedido-1',
        total: 250.2,
        estadoPago: 'aprobado',
      });
    });
  });

  describe('obtenerPorId', () => {
    it('lanza NotFound si el pedido no existe o pertenece a otro usuario', async () => {
      await montarServicio(crearTransaccionMock([]));
      repository.findByIdYUsuarioId.mockResolvedValue(null);

      await expect(
        service.obtenerPorId(usuario.id, 'pedido-x'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
