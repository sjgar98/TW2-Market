import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from '../../entities/producto.entity.js';
import { ProductosController } from './productos.controller.js';
import { ProductosService } from './productos.service.js';
import { ProductosRepository } from './productos.repository.js';

@Module({
  imports: [TypeOrmModule.forFeature([Producto])],
  controllers: [ProductosController],
  providers: [ProductosService, ProductosRepository],
})
export class ProductosModule {}