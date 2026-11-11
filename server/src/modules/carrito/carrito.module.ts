import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemCarrito } from '../../entities/item-carrito.entity.js';
import { Producto } from '../../entities/producto.entity.js';
import { CarritoController } from './carrito.controller.js';
import { CarritoRepository } from './carrito.repository.js';
import { CarritoService } from './carrito.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([ItemCarrito, Producto])],
  controllers: [CarritoController],
  providers: [CarritoService, CarritoRepository],
})
export class CarritoModule {}