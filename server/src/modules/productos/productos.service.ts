import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductosRepository } from './productos.repository.js';
import { ProductoRespuestaDto } from './dto/producto-respuesta.dto.js';
import { ListadoPaginadoDto } from './dto/listado-paginado.dto.js';
import { ListarProductosDto } from './dto/listar-productos.dto.js';
import { CrearProductoDto } from './dto/crear-producto.dto.js';

const COLORES_MARCA: Record<string, string> = {
  apple: '1d1d1f',
  samsung: '1428a0',
  motorola: '6228d7',
  xiaomi: 'ff6900',
  google: '4285f4',
};

@Injectable()
export class ProductosService {
  constructor(private readonly productosRepository: ProductosRepository) {}

  async listar(
    filtros: ListarProductosDto,
  ): Promise<ListadoPaginadoDto<ProductoRespuestaDto>> {
    const [productos, total] =
      await this.productosRepository.findPaginado(filtros);
    return new ListadoPaginadoDto(
      productos.map((p) => new ProductoRespuestaDto(p)),
      total,
      filtros.pagina,
      filtros.limite,
    );
  }

  listarMarcas(): Promise<string[]> {
    return this.productosRepository.findMarcas();
  }

  async obtenerPorId(id: string): Promise<ProductoRespuestaDto> {
    const producto = await this.productosRepository.findById(id);
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return new ProductoRespuestaDto(producto);
  }

  async crear(dto: CrearProductoDto): Promise<ProductoRespuestaDto> {
    const color = COLORES_MARCA[dto.marca.trim().toLowerCase()] ?? '6750a4';
    const producto = await this.productosRepository.crear({
      nombre: dto.nombre,
      marca: dto.marca,
      descripcion: dto.descripcion,
      clasificacion: dto.clasificacion,
      precio: dto.precio,
      stock: dto.stock,
      imagenUrl:
        dto.imagenUrl ??
        `https://placehold.co/600x600/${color}/ffffff?text=${encodeURIComponent(dto.nombre)}`,
      pantalla: dto.pantalla,
      almacenamientoGb: dto.almacenamientoGb,
      ramGb: dto.ramGb,
      bateriaMah: dto.bateriaMah,
      camara: dto.camara,
    });
    return new ProductoRespuestaDto(producto);
  }
}
