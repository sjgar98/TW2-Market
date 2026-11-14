import { ConflictException } from '@nestjs/common';
import type { ProductoSinStockDto } from './dto/pedido-respuesta.dto.js';

export class StockInsuficienteException extends ConflictException {
  constructor(productos: ProductoSinStockDto[]) {
    super({
      message: 'No hay stock suficiente para confirmar el pedido',
      productos,
    });
  }
}
