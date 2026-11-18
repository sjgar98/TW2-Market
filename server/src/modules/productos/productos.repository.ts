import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, LessThanOrEqual, Repository, Between, MoreThanOrEqual } from 'typeorm';
import { Producto } from '../../entities/producto.entity.js';
import { ListarProductosDto } from './dto/listar-productos.dto.js';

@Injectable()
export class ProductosRepository {
  constructor(
    @InjectRepository(Producto)
    private readonly repo: Repository<Producto>,
  ) {}

  async findPaginado(filtros: ListarProductosDto): Promise<[Producto[], number]> {
  const where: FindOptionsWhere<Producto> = {};
  if (filtros.marca) where.marca = ILike(filtros.marca);

  if (filtros.precioMin !== undefined && filtros.precioMax !== undefined) {
  where.precio = Between(filtros.precioMin, filtros.precioMax);
} else if (filtros.precioMin !== undefined) {
  where.precio = MoreThanOrEqual(filtros.precioMin);
} else if (filtros.precioMax !== undefined) {
  where.precio = LessThanOrEqual(filtros.precioMax);
}


  return this.repo.findAndCount({
    where,
    order: { nombre: 'ASC' },
    skip: (filtros.pagina - 1) * filtros.limite,
    take: filtros.limite,
  });
}

  findById(id: string): Promise<Producto | null> {
    return this.repo.findOne({ where: { id } });
  }
}