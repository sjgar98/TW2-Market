export interface ItemPedido {
  productoId: string;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
}

export interface Pedido {
  id: string;
  creadoEn: string;
  direccionEnvio: string;
  total: number;
  estadoPago: 'aprobado';
  items: ItemPedido[];
}

export interface ProductoSinStock {
  productoId: string;
  nombre: string;
  stockDisponible: number;
}
