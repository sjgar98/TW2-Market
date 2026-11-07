import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator.js';
import { ProductosService } from './productos.service.js';
import { ProductoRespuestaDto } from './dto/producto-respuesta.dto.js';
import { ListadoPaginadoDto } from './dto/listado-paginado.dto.js';
import { ListarProductosDto } from './dto/listar-productos.dto.js';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Public()
  @Get()
  listar(@Query() query: ListarProductosDto): Promise<ListadoPaginadoDto<ProductoRespuestaDto>> {
    return this.productosService.listar(query.pagina, query.limite, query.busqueda);
  }

  @Public()
  @Get(':id')
  obtenerPorId(@Param('id', ParseUUIDPipe) id: string): Promise<ProductoRespuestaDto> {
    return this.productosService.obtenerPorId(id);
  }
}