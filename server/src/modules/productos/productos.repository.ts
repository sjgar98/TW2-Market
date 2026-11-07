import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Producto } from '../../entities/producto.entity.js';

@Injectable()
export class ProductosRepository {
  constructor(
    @InjectRepository(Producto)
    private readonly repo: Repository<Producto>,
  ) {}

  async findPaginado(pagina: number, limite: number, busqueda?: string): Promise<[Producto[], number]> {
    return this.repo.findAndCount({
      where: busqueda ? [{ nombre: ILike(`%${busqueda}%`) }, { marca: ILike(`%${busqueda}%`) }] : undefined,
      order: { nombre: 'ASC' },
      skip: (pagina - 1) * limite,
      take: limite,
    });
  }

  findById(id: string): Promise<Producto | null> {
    return this.repo.findOne({ where: { id } });
  }
}