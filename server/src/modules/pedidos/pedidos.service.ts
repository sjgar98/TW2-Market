import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ItemCarrito } from '../../entities/item-carrito.entity.js';
import type { UsuarioPublico } from '../../entities/usuario.entity.js';
import {
  PedidoRespuestaDto,
  ProductoSinStockDto,
} from './dto/pedido-respuesta.dto.js';
import { StockInsuficienteException } from './pedidos.errors.js';
import { PedidosRepository } from './pedidos.repository.js';

@Injectable()
export class PedidosService {
  constructor(private readonly pedidosRepository: PedidosRepository) {}

  async confirmar(usuario: UsuarioPublico): Promise<PedidoRespuestaDto> {
    const pedidoId = await this.pedidosRepository.transaccion(async (tx) => {
      const items = await tx.findItemsDelCarrito(usuario.id);
      if (items.length === 0)
        throw new BadRequestException('El carrito está vacío');

      const sinStock = items.filter(
        (item) => item.cantidad > item.producto.stock,
      );
      if (sinStock.length > 0) {
        throw new StockInsuficienteException(sinStock.map(toProductoSinStock));
      }

      for (const item of items) {
        const descontado = await tx.descontarStock(
          item.producto.id,
          item.cantidad,
        );
        if (!descontado)
          throw new StockInsuficienteException([toProductoSinStock(item)]);
      }

      const pedido = await tx.guardarPedido({
        usuario: { id: usuario.id },
        direccionEnvio: usuario.direccion,
        total: calcularTotal(items),
        items: items.map((item) => ({
          producto: { id: item.producto.id },
          cantidad: item.cantidad,
          precioUnitario: Number(item.producto.precio),
        })),
      });
      await tx.vaciarCarrito(usuario.id);
      return pedido.id;
    });

    return this.obtenerPorId(usuario.id, pedidoId);
  }

  async obtenerPorId(
    usuarioId: string,
    pedidoId: string,
  ): Promise<PedidoRespuestaDto> {
    const pedido = await this.pedidosRepository.findByIdYUsuarioId(
      pedidoId,
      usuarioId,
    );
    if (!pedido) throw new NotFoundException('Pedido no encontrado');
    return new PedidoRespuestaDto(pedido);
  }
}

function toProductoSinStock(item: ItemCarrito): ProductoSinStockDto {
  return new ProductoSinStockDto(item.producto);
}

function calcularTotal(items: ItemCarrito[]): number {
  const centavos = items.reduce(
    (suma, item) =>
      suma + Math.round(Number(item.producto.precio) * 100) * item.cantidad,
    0,
  );
  return centavos / 100;
}
