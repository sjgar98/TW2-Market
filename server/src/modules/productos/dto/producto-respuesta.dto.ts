export class ProductoRespuestaDto {
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

  constructor(producto: {
    id: string; nombre: string; marca: string; descripcion: string; clasificacion: string;
    precio: number; stock: number; imagenUrl: string; pantalla: string;
    almacenamientoGb: number; ramGb: number; bateriaMah: number; camara: string;
  }) {
    this.id = producto.id;
    this.nombre = producto.nombre;
    this.marca = producto.marca;
    this.descripcion = producto.descripcion;
    this.clasificacion = producto.clasificacion;
    this.precio = Number(producto.precio);
    this.stock = producto.stock;
    this.disponible = producto.stock > 0;
    this.imagenUrl = producto.imagenUrl;
    this.pantalla = producto.pantalla;
    this.almacenamientoGb = producto.almacenamientoGb;
    this.ramGb = producto.ramGb;
    this.bateriaMah = producto.bateriaMah;
    this.camara = producto.camara;
  }
}