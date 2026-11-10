import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ItemCarrito } from '../../entities/item-carrito.entity.js';
import { CarritoRepository } from './carrito.repository.js';
import { AgregarItemDto } from './dto/agregar-item.dto.js';

@Injectable()
export class CarritoService {
  constructor(private readonly carritoRepository: CarritoRepository) {}

  listar(usuarioId: string): Promise<ItemCarrito[]> {
    return this.carritoRepository.findByUsuarioId(usuarioId);
  }

  async agregar(usuarioId: string, dto: AgregarItemDto): Promise<{ productoId: string; cantidad: number }> {
    const producto = await this.carritoRepository.findProductoById(dto.productoId);
    if (!producto) throw new NotFoundException('Producto no encontrado');

    const item = await this.carritoRepository.findByUsuarioIdAndProductoId(usuarioId, dto.productoId);
    const total = (item?.cantidad ?? 0) + dto.cantidad;
    if (total > producto.stock) throw new ConflictException('No hay stock suficiente');

    if (item) {
      item.cantidad = total;
      await this.carritoRepository.guardar(item);
    } else {
      await this.carritoRepository.guardar({
        usuario: { id: usuarioId },
        producto: { id: dto.productoId },
        cantidad: total,
      });
    }
    return { productoId: dto.productoId, cantidad: total };
  }
}