export interface ItemCarrito {
  productoId: string;
  nombre: string;
  precio: number;
  stock: number;
  cantidad: number;
}

export interface Carrito {
  items: ItemCarrito[];
  direccionEnvio: string;
}