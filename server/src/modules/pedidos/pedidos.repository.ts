import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, DeepPartial, EntityManager, Repository } from 'typeorm';
import { ItemCarrito } from '../../entities/item-carrito.entity.js';
import { Pedido } from '../../entities/pedido.entity.js';
import { Producto } from '../../entities/producto.entity.js';

export interface TransaccionPedidos {
  findItemsDelCarrito(usuarioId: string): Promise<ItemCarrito[]>;
  descontarStock(productoId: string, cantidad: number): Promise<boolean>;
  guardarPedido(pedido: DeepPartial<Pedido>): Promise<Pedido>;
  vaciarCarrito(usuarioId: string): Promise<void>;
}

function crearTransaccion(manager: EntityManager): TransaccionPedidos {
  return {
    findItemsDelCarrito: (usuarioId) =>
      manager.find(ItemCarrito, {
        where: { usuario: { id: usuarioId } },
        relations: { producto: true },
      }),

    descontarStock: async (productoId, cantidad) => {
      const resultado = await manager
        .createQueryBuilder()
        .update(Producto)
        .set({ stock: () => 'stock - :cantidad' })
        .where('id = :productoId AND stock >= :cantidad', {
          productoId,
          cantidad,
        })
        .execute();
      return (resultado.affected ?? 0) > 0;
    },

    guardarPedido: (pedido) => manager.save(Pedido, pedido),

    vaciarCarrito: async (usuarioId) => {
      await manager
        .createQueryBuilder()
        .delete()
        .from(ItemCarrito)
        .where('"usuarioId" = :usuarioId', { usuarioId })
        .execute();
    },
  };
}

@Injectable()
export class PedidosRepository {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
  ) {}

  transaccion<T>(trabajo: (tx: TransaccionPedidos) => Promise<T>): Promise<T> {
    return this.dataSource.transaction((manager) =>
      trabajo(crearTransaccion(manager)),
    );
  }

  findByIdYUsuarioId(id: string, usuarioId: string): Promise<Pedido | null> {
    return this.pedidoRepository.findOne({
      where: { id, usuario: { id: usuarioId } },
      relations: { items: { producto: true } },
    });
  }
}
