import { ItemCarrito } from '../../../entities/item-carrito.entity.js';

export class ItemCarritoRespuestaDto {
  productoId: string;
  nombre: string;
  clasificacion: string;
  precio: number;
  stock: number;
  cantidad: number;

  constructor(item: ItemCarrito) {
    this.productoId = item.producto.id;
    this.nombre = item.producto.nombre;
    this.clasificacion = item.producto.clasificacion;
    this.precio = Number(item.producto.precio);
    this.stock = item.producto.stock;
    this.cantidad = item.cantidad;
  }
}

export class CarritoRespuestaDto {
  items: ItemCarritoRespuestaDto[];
  direccionEnvio: string;

  constructor(items: ItemCarrito[], direccionEnvio: string) {
    this.items = items.map((item) => new ItemCarritoRespuestaDto(item));
    this.direccionEnvio = direccionEnvio;
  }
}