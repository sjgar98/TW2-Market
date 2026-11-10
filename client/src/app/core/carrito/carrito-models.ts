export interface ItemCarrito {
  productoId: string;
  nombre: string;
  clasificacion: string;
  precio: number;
  stock: number;
  cantidad: number;
}

export interface Carrito {
  items: ItemCarrito[];
  direccionEnvio: string;
}