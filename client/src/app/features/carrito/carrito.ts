import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { CarritoApi } from '../../core/carrito/carrito-api';
import { Carrito as CarritoDatos, ItemCarrito } from '../../core/carrito/carrito-models';

const FORMATO_PRECIO = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

@Component({
  selector: 'app-carrito',
  imports: [MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './carrito.html',
})
export class Carrito {
  private readonly carritoApi = inject(CarritoApi);
  private readonly snackBar = inject(MatSnackBar);

  readonly carrito = signal<CarritoDatos | null>(null);
  readonly cargando = signal(true);
  readonly error = signal(false);

  readonly items = computed(() => this.carrito()?.items ?? []);
  readonly unidades = computed(() => this.items().reduce((suma, i) => suma + i.cantidad, 0));
  readonly total = computed(() => this.items().reduce((suma, i) => suma + i.cantidad * i.precio, 0));

  constructor() {
    this.cargar();
  }

  formatearPrecio(precio: number): string {
    return FORMATO_PRECIO.format(precio);
  }

  cambiarCantidad(item: ItemCarrito, cantidad: number): void {
    if (cantidad < 1 || cantidad > item.stock) return;
    this.carritoApi.cambiarCantidad(item.productoId, cantidad).subscribe({
      next: () => this.cargar(),
      error: () => this.avisar('No se pudo cambiar la cantidad'),
    });
  }

  quitar(item: ItemCarrito): void {
    this.carritoApi.quitar(item.productoId).subscribe({
      next: () => this.cargar(),
      error: () => this.avisar('No se pudo quitar el producto'),
    });
  }

  private cargar(): void {
    this.carritoApi.obtener().subscribe({
      next: (carrito) => {
        this.carrito.set(carrito);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(true);
        this.cargando.set(false);
      },
    });
  }

  private avisar(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 4000 });
  }
}