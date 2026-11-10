import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator.js';
import type { UsuarioPublico } from '../../entities/usuario.entity.js';
import { CarritoService } from './carrito.service.js';
import { AgregarItemDto } from './dto/agregar-item.dto.js';

@Controller('carrito')
export class CarritoController {
  constructor(private readonly carritoService: CarritoService) {}

  @Get()
  listar(@UsuarioActual() usuario: UsuarioPublico) {
    return this.carritoService.listar(usuario.id);
  }

  @Post('items')
  agregar(@UsuarioActual() usuario: UsuarioPublico, @Body() dto: AgregarItemDto) {
    return this.carritoService.agregar(usuario.id, dto);
  }
}