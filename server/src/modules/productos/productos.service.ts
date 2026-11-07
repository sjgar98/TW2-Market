import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductosRepository } from './productos.repository.js';
import { ProductoRespuestaDto } from './dto/producto-respuesta.dto.js';
import { ListadoPaginadoDto } from './dto/listado-paginado.dto.js';

@Injectable()
export class ProductosService {
  constructor(private readonly productosRepository: ProductosRepository) {}

  async listar(pagina: number, limite: number, busqueda?: string): Promise<ListadoPaginadoDto<ProductoRespuestaDto>> {
    const [productos, total] = await this.productosRepository.findPaginado(pagina, limite, busqueda);
    return new ListadoPaginadoDto(productos.map((p) => new ProductoRespuestaDto(p)), total, pagina, limite);
  }

  async obtenerPorId(id: string): Promise<ProductoRespuestaDto> {
    const producto = await this.productosRepository.findById(id);
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return new ProductoRespuestaDto(producto);
  }
}