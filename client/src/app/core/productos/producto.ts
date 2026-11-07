export interface Producto {
  id: string;
  nombre: string;
  marca: string;
  descripcion: string;
  clasificacion: string;
  precio: number;
  stock: number;
  disponible: boolean;
  imagenUrl: string;
  pantalla: string;
  almacenamientoGb: number;
  ramGb: number;
  bateriaMah: number;
  camara: string;
}

export interface ListadoPaginado<T> {
  items: T[];
  total: number;
  pagina: number;
  limite: number;
}