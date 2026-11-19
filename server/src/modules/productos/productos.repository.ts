import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsWhere,
  ILike,
  LessThanOrEqual,
  Repository,
  Between,
  MoreThanOrEqual,
} from 'typeorm';
import { Producto } from '../../entities/producto.entity.js';
import { ListarProductosDto } from './dto/listar-productos.dto.js';

@Injectable()
export class ProductosRepository {
  constructor(
    @InjectRepository(Producto)
    private readonly repo: Repository<Producto>,
  ) { }

  async findPaginado(filtros: ListarProductosDto): Promise<[Producto[], number]> {
    const where: FindOptionsWhere<Producto> = {};
    if (filtros.marca) where.marca = ILike(filtros.marca);
    if (filtros.busqueda) where.nombre = ILike(`%${filtros.busqueda}%`);

    if (filtros.precioMin !== undefined && filtros.precioMax !== undefined) {
      where.precio = Between(filtros.precioMin, filtros.precioMax);
    } else if (filtros.precioMin !== undefined) {
      where.precio = MoreThanOrEqual(filtros.precioMin);
    } else if (filtros.precioMax !== undefined) {
      where.precio = LessThanOrEqual(filtros.precioMax);
    }

    const direccion = filtros.orden === 'precio_desc' ? 'DESC' : 'ASC';
    const campo = filtros.orden ? 'p.precio' : 'p.nombre';

    return this.repo
      .createQueryBuilder('p')
      .where(where)
      .orderBy('CASE WHEN p.stock > 0 THEN 0 ELSE 1 END', 'ASC')
      .addOrderBy(campo, direccion)
      .addOrderBy('p.nombre', 'ASC')
      .skip((filtros.pagina - 1) * filtros.limite)
      .take(filtros.limite)
      .getManyAndCount();
  }

  async findMarcas(): Promise<string[]> {
    const filas = await this.repo
      .createQueryBuilder('p')
      .select('DISTINCT p.marca', 'marca')
      .orderBy('p.marca', 'ASC')
      .getRawMany<{ marca: string }>();
    return filas.map((f) => f.marca);
  }

  findById(id: string): Promise<Producto | null> {
    return this.repo.findOne({ where: { id } });
  }
}
