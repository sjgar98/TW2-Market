import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductosRepository } from './productos.repository.js';
import { ProductoRespuestaDto } from './dto/producto-respuesta.dto.js';
import { ListadoPaginadoDto } from './dto/listado-paginado.dto.js';
import { ListarProductosDto } from './dto/listar-productos.dto.js';

@Injectable()
export class ProductosService {
  constructor(private readonly productosRepository: ProductosRepository) {}

  async listar(filtros: ListarProductosDto){
    const [productos, total] = await this.productosRepository.findPaginado(filtros);
    return new ListadoPaginadoDto(productos.map((p) => new ProductoRespuestaDto(p)), total, filtros.pagina, filtros.limite);
  }

  async obtenerPorId(id: string): Promise<ProductoRespuestaDto> {
    const producto = await this.productosRepository.findById(id);
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return new ProductoRespuestaDto(producto);
  }
}