import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator.js';
import type { UsuarioPublico } from '../../entities/usuario.entity.js';
import { CarritoService } from './carrito.service.js';
import { ActualizarCantidadDto } from './dto/actualizar-cantidad.dto.js';
import { AgregarItemDto } from './dto/agregar-item.dto.js';
import { CarritoRespuestaDto } from './dto/carrito-respuesta.dto.js';

@Controller('carrito')
export class CarritoController {
  constructor(private readonly carritoService: CarritoService) {}

  @Get()
  listar(@UsuarioActual() usuario: UsuarioPublico): Promise<CarritoRespuestaDto> {
    return this.carritoService.listar(usuario.id, usuario.direccion);
  }

  @Post('items')
  agregar(@UsuarioActual() usuario: UsuarioPublico, @Body() dto: AgregarItemDto) {
    return this.carritoService.agregar(usuario.id, dto);
  }

  @Patch('items/:productoId')
  cambiarCantidad(
    @UsuarioActual() usuario: UsuarioPublico,
    @Param('productoId', ParseUUIDPipe) productoId: string,
    @Body() dto: ActualizarCantidadDto,
  ) {
    return this.carritoService.cambiarCantidad(usuario.id, productoId, dto.cantidad);
  }

  @Delete('items/:productoId')
  @HttpCode(204)
  quitar(
    @UsuarioActual() usuario: UsuarioPublico,
    @Param('productoId', ParseUUIDPipe) productoId: string,
  ): Promise<void> {
    return this.carritoService.quitar(usuario.id, productoId);
  }
}