import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemPedido } from '../../entities/item-pedido.entity.js';
import { Pedido } from '../../entities/pedido.entity.js';
import { PedidosController } from './pedidos.controller.js';
import { PedidosRepository } from './pedidos.repository.js';
import { PedidosService } from './pedidos.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Pedido, ItemPedido])],
  controllers: [PedidosController],
  providers: [PedidosService, PedidosRepository],
})
export class PedidosModule {}
