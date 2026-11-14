import type { ItemPedido } from '../../../entities/item-pedido.entity.js';
import type { Pedido } from '../../../entities/pedido.entity.js';

export class ProductoSinStockDto {
  productoId: string;
  nombre: string;
  stockDisponible: number;

  constructor(producto: { id: string; nombre: string; stock: number }) {
    this.productoId = producto.id;
    this.nombre = producto.nombre;
    this.stockDisponible = producto.stock;
  }
}

export class ItemPedidoRespuestaDto {
  productoId: string;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;

  constructor(item: ItemPedido) {
    this.productoId = item.producto.id;
    this.nombre = item.producto.nombre;
    this.precioUnitario = Number(item.precioUnitario);
    this.cantidad = item.cantidad;
    this.subtotal = Math.round(this.precioUnitario * item.cantidad * 100) / 100;
  }
}

export class PedidoRespuestaDto {
  id: string;
  creadoEn: string;
  direccionEnvio: string;
  total: number;
  estadoPago: 'aprobado';
  items: ItemPedidoRespuestaDto[];

  constructor(pedido: Pedido) {
    this.id = pedido.id;
    this.creadoEn = pedido.creadoEn.toISOString();
    this.direccionEnvio = pedido.direccionEnvio;
    this.total = Number(pedido.total);
    this.estadoPago = 'aprobado';
    this.items = pedido.items.map((item) => new ItemPedidoRespuestaDto(item));
  }
}
