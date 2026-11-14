import { Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator.js';
import type { UsuarioPublico } from '../../entities/usuario.entity.js';
import { PedidoRespuestaDto } from './dto/pedido-respuesta.dto.js';
import { PedidosService } from './pedidos.service.js';

@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post()
  confirmar(
    @UsuarioActual() usuario: UsuarioPublico,
  ): Promise<PedidoRespuestaDto> {
    return this.pedidosService.confirmar(usuario);
  }

  @Get(':id')
  obtenerPorId(
    @UsuarioActual() usuario: UsuarioPublico,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PedidoRespuestaDto> {
    return this.pedidosService.obtenerPorId(usuario.id, id);
  }
}
