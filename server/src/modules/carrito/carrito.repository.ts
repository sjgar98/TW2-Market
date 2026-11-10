import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { ItemCarrito } from '../../entities/item-carrito.entity.js';
import { Producto } from '../../entities/producto.entity.js';

@Injectable()
export class CarritoRepository {
  constructor(
    @InjectRepository(ItemCarrito)
    private readonly itemCarritoRepository: Repository<ItemCarrito>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
  ) {}

  findProductoById(id: string): Promise<Producto | null> {
    return this.productoRepository.findOne({ where: { id } });
  }

  findByUsuarioIdAndProductoId(usuarioId: string, productoId: string): Promise<ItemCarrito | null> {
    return this.itemCarritoRepository.findOne({
      where: { usuario: { id: usuarioId }, producto: { id: productoId } },
    });
  }

  guardar(item: DeepPartial<ItemCarrito>): Promise<ItemCarrito> {
    return this.itemCarritoRepository.save(item);
  }

  findByUsuarioId(usuarioId: string): Promise<ItemCarrito[]> {
    return this.itemCarritoRepository.find({
      where: { usuario: { id: usuarioId } },
      relations: { producto: true },
      order: { producto: { nombre: 'ASC' } },
    });
  }
}