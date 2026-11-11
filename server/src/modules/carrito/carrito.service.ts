import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CarritoRepository } from './carrito.repository.js';
import { AgregarItemDto } from './dto/agregar-item.dto.js';
import { CarritoRespuestaDto } from './dto/carrito-respuesta.dto.js';

@Injectable()
export class CarritoService {
  constructor(private readonly carritoRepository: CarritoRepository) {}

  async listar(usuarioId: string, direccionEnvio: string): Promise<CarritoRespuestaDto> {
    const items = await this.carritoRepository.findByUsuarioId(usuarioId);
    return new CarritoRespuestaDto(items, direccionEnvio);
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

  async cambiarCantidad(
    usuarioId: string,
    productoId: string,
    cantidad: number,
  ): Promise<{ productoId: string; cantidad: number }> {
    const item = await this.carritoRepository.findByUsuarioIdAndProductoId(usuarioId, productoId);
    if (!item) throw new NotFoundException('El producto no está en el carrito');

    const producto = await this.carritoRepository.findProductoById(productoId);
    if (!producto || cantidad > producto.stock) throw new ConflictException('No hay stock suficiente');

    item.cantidad = cantidad;
    await this.carritoRepository.guardar(item);
    return { productoId, cantidad };
  }

  async quitar(usuarioId: string, productoId: string): Promise<void> {
    const item = await this.carritoRepository.findByUsuarioIdAndProductoId(usuarioId, productoId);
    if (!item) throw new NotFoundException('El producto no está en el carrito');
    await this.carritoRepository.eliminar(item);
  }
}